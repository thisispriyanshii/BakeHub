package com.bakehub.my.service;

import com.bakehub.my.dto.CreateOrderRequest;
import com.bakehub.my.dto.OrderItemRequest;
import com.bakehub.my.entity.*;
import com.bakehub.my.exception.ProductNotFoundException;
import com.bakehub.my.repository.OrderRepository;
import com.bakehub.my.repository.ProductRepository;
import com.bakehub.my.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid user id"));

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setLatitude(request.getLatitude());
        order.setLongitude(request.getLongitude());

        List<OrderItem> items = request.getItems().stream().map(this::createOrderItem).collect(Collectors.toList());
        double total = items.stream().mapToDouble(OrderItem::getLineTotal).sum();

        items.forEach(item -> item.setOrder(order));
        order.setItems(items);
        order.setTotalPrice(total);

        return orderRepository.save(order);
    }

    private OrderItem createOrderItem(OrderItemRequest itemRequest) {
        Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(itemRequest.getProductId()));

        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(itemRequest.getQuantity());
        item.setItemPrice(product.getPrice());
        item.setCustomizationDetails(itemRequest.getCustomizationDetails());
        item.setLineTotal(product.getPrice() * itemRequest.getQuantity());

        return item;
    }

    public List<Order> getOrdersForUser(Long userId) {
        return orderRepository.findByUserId(userId);
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
}
