package com.bakehub.my.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "customization_options")
@Data
public class CustomizationOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String type;
    private Double priceModifier;
}
