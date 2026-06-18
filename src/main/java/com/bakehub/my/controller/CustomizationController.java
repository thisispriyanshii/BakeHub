package com.bakehub.my.controller;

import com.bakehub.my.entity.CustomizationOption;
import com.bakehub.my.service.CustomizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/customizations")
public class CustomizationController {

    @Autowired
    private CustomizationService customizationService;

    @GetMapping
    public ResponseEntity<List<CustomizationOption>> getAllOptions() {
        return ResponseEntity.ok(customizationService.findAll());
    }

    @PostMapping
    public ResponseEntity<CustomizationOption> addOption(@RequestBody CustomizationOption option) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customizationService.save(option));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomizationOption> updateOption(@PathVariable Long id, @RequestBody CustomizationOption option) {
        option.setId(id);
        return ResponseEntity.ok(customizationService.save(option));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOption(@PathVariable Long id) {
        customizationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
