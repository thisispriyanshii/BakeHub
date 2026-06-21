package com.bakehub.my.service;

import com.bakehub.my.dto.CreateOrderRequest;
import com.bakehub.my.dto.CustomCakeOrderRequest;
import com.bakehub.my.dto.OrderItemRequest;
import com.bakehub.my.entity.*;
import com.bakehub.my.exception.ProductNotFoundException;
import com.bakehub.my.repository.CouponRepository;
import com.bakehub.my.repository.OrderRepository;
import com.bakehub.my.repository.ProductRepository;
import com.bakehub.my.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final String CUSTOM_CAKE_PRODUCT_NAME = "Custom Cake";

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomizationService customizationService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CouponRepository couponRepository;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid user id"));

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(request.getDeliveryAddress());

        List<OrderItem> items = request.getItems().stream().map(this::createOrderItem).collect(Collectors.toList());
        double total = items.stream().mapToDouble(OrderItem::getLineTotal).sum();

        items.forEach(item -> item.setOrder(order));
        order.setItems(items);
        order.setTotalPrice(applyCouponDiscount(total, findValidCoupon(request.getCouponCode())));
        order.setCouponCode(normalizeCouponCode(request.getCouponCode()));

        return orderRepository.save(order);
    }

    @Transactional
    public Order createCustomCakeOrder(String userEmail, CustomCakeOrderRequest request) {
        if (request.getDeliveryAddress() == null || request.getDeliveryAddress().isBlank()) {
            throw new IllegalArgumentException("Delivery address is required");
        }

        if (request.getDeliveryDate() == null || request.getDeliveryDate().isBlank()) {
            throw new IllegalArgumentException("Delivery date is required");
        }

        if (request.getDeliveryTime() == null || request.getDeliveryTime().isBlank()) {
            throw new IllegalArgumentException("Delivery time is required");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user"));

        Product product = productRepository.findByName(CUSTOM_CAKE_PRODUCT_NAME)
                .orElseThrow(() -> new ProductNotFoundException("Custom Cake product is not configured"));

        double calculatedPrice = customizationService.calculateCustomCakePrice(
                request.getWeight(),
                request.getToppings()
        );

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setOccasion(request.getOccasion());
        order.setDeliveryDate(LocalDate.parse(request.getDeliveryDate()));
        // support coupon code if provided
        try { order.setCouponCode(request.getCouponCode()); } catch (Exception ignored) {}

        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(1);
        item.setItemPrice(calculatedPrice);
        item.setLineTotal(calculatedPrice);
        item.setCustomizationDetails(buildCustomizationDetails(request, calculatedPrice));
        item.setOrder(order);

        order.setItems(List.of(item));
        order.setTotalPrice(applyCouponDiscount(calculatedPrice, findValidCoupon(request.getCouponCode())));
        order.setCouponCode(normalizeCouponCode(request.getCouponCode()));
        return orderRepository.save(order);
    }

    @Transactional
    public Order createMenuOrder(String userEmail, CreateOrderRequest request) {
        if (request.getDeliveryAddress() == null || request.getDeliveryAddress().isBlank()) {
            throw new IllegalArgumentException("Delivery address is required");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order items are required");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user"));

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(request.getDeliveryAddress());

        List<OrderItem> items = request.getItems().stream()
                .map(this::createOrderItem)
                .collect(Collectors.toList());

        double total = items.stream().mapToDouble(OrderItem::getLineTotal).sum();
        items.forEach(item -> item.setOrder(order));

        order.setItems(items);
        order.setTotalPrice(applyCouponDiscount(total, findValidCoupon(request.getCouponCode())));
        order.setCouponCode(normalizeCouponCode(request.getCouponCode()));

        return orderRepository.save(order);
    }

    private Coupon findValidCoupon(String couponCode) {
        if (couponCode == null || couponCode.isBlank()) {
            return null;
        }

        Coupon coupon = couponRepository.findByCodeAndActiveTrue(couponCode.trim()).orElse(null);
        if (coupon == null) {
            return null;
        }

        if (coupon.getExpiresAt() != null && LocalDate.now().isAfter(coupon.getExpiresAt())) {
            coupon.setActive(false);
            couponRepository.save(coupon);
            return null;
        }

        return coupon;
    }

    private String normalizeCouponCode(String couponCode) {
        Coupon coupon = findValidCoupon(couponCode);
        return coupon == null ? null : coupon.getCode();
    }

    private double applyCouponDiscount(double total, Coupon coupon) {
        if (coupon == null || total <= 0) {
            return total;
        }

        if (coupon.getExpiresAt() != null && LocalDate.now().isAfter(coupon.getExpiresAt())) {
            return total;
        }

        double minAmount = coupon.getMinAmount() == null ? 0 : coupon.getMinAmount();
        if (total < minAmount) {
            return total;
        }

        String type = coupon.getType() == null ? "PERCENTAGE" : coupon.getType();
        double discount = 0;

        if ("FLAT".equalsIgnoreCase(type)) {
            discount = coupon.getFlatAmount() == null ? 0 : coupon.getFlatAmount();
        } else {
            double discountPercent = coupon.getDiscountPercent() == null ? 0 : coupon.getDiscountPercent();
            if (discountPercent > 0) {
                discount = total * (discountPercent / 100.0);
            }
        }

        return Math.max(0, total - discount);
    }

    private String buildCustomizationDetails(CustomCakeOrderRequest request, double calculatedPrice) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("occasion", request.getOccasion());
        details.put("shape", request.getShape());
        details.put("flavor", request.getFlavor());
        details.put("weight", request.getWeight());
        details.put("frosting", request.getFrosting());
        details.put("toppings", request.getToppings());
        details.put("message", request.getMessage());
        details.put("deliveryDate", request.getDeliveryDate());
        details.put("deliveryTime", request.getDeliveryTime());
        details.put("hasReferenceImage", Boolean.TRUE.equals(request.getHasReferenceImage()));
        details.put("estimatedPrice", calculatedPrice);

        try {
            return objectMapper.writeValueAsString(details);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Unable to serialize customization details");
        }
    }

    private OrderItem createOrderItem(OrderItemRequest itemRequest) {
        if (itemRequest == null || itemRequest.getProductId() == null) {
            throw new IllegalArgumentException("Order item productId must not be null");
        }

        int quantity = itemRequest.getQuantity() == null || itemRequest.getQuantity() < 1
                ? 1
                : itemRequest.getQuantity();

        Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(itemRequest.getProductId()));

        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setItemPrice(product.getPrice());
        item.setCustomizationDetails(itemRequest.getCustomizationDetails());
        item.setLineTotal(product.getPrice() * quantity);

        return item;
    }

    public List<Order> getOrdersForUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersForUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user"));
        return orderRepository.findByUserId(user.getId());
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }
}
