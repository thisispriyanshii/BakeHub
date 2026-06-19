package com.bakehub.my.controller;

import com.bakehub.my.entity.CustomizationOption;
import com.bakehub.my.service.CustomizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/customizations")
public class PublicCustomizationController {

    @Autowired
    private CustomizationService customizationService;

    @GetMapping
    public ResponseEntity<List<CustomizationOption>> getAllOptions() {
        return ResponseEntity.ok(customizationService.findAll());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<CustomizationOption>> getOptionsByType(@PathVariable String type) {
        return ResponseEntity.ok(customizationService.findByType(type));
    }
}
