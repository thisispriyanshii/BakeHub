package com.bakehub.my.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Long orderId;

    private Double rating;

    @Column(columnDefinition = "text")
    private String text;

    private LocalDateTime createdAt = LocalDateTime.now();
}
