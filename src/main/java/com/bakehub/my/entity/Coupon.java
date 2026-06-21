package com.bakehub.my.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private String type = "PERCENTAGE";

    private Double discountPercent;

    private Double flatAmount;

    private Double minAmount;

    private Boolean active = true;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expiresAt;

    private LocalDateTime createdAt = LocalDateTime.now();
}
