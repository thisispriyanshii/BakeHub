package com.bakehub.my.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private Double discountPercent;

    private Double minAmount;

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();
}
