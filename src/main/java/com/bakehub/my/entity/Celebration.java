package com.bakehub.my.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "celebrations")
@Data
public class Celebration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String personName;     // Mom, Dad, Sister, Rahul

    private String relation;       // Mother, Father, Friend, Spouse

    private String occasion;       // Birthday, Anniversary

    private LocalDate eventDate;

    private Boolean yearlyReminder = true;
}