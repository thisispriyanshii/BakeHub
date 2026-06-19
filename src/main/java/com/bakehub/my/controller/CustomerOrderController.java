package com.bakehub.my.controller;

import com.bakehub.my.dto.CreateOrderRequest;
import com.bakehub.my.dto.CustomCakeOrderRequest;
import com.bakehub.my.entity.Order;
import com.bakehub.my.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class CustomerOrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/custom-cake")
    public ResponseEntity<Map<String, Object>> createCustomCakeOrder(
            Authentication authentication,
            @RequestBody CustomCakeOrderRequest request) {
        Order order = orderService.createCustomCakeOrder(authentication.getName(), request);
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("status", order.getStatus().name());
        response.put("message", "Custom cake order placed successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createMenuOrder(
            Authentication authentication,
            @RequestBody CreateOrderRequest request) {
        Order order = orderService.createMenuOrder(authentication.getName(), request);
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("status", order.getStatus().name());
        response.put("message", "Menu order placed successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrdersForUserEmail(authentication.getName()));
    }
}
