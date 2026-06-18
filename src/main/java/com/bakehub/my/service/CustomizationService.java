package com.bakehub.my.service;

import com.bakehub.my.entity.CustomizationOption;
import com.bakehub.my.repository.CustomizationOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomizationService {

    @Autowired
    private CustomizationOptionRepository customizationOptionRepository;

    public List<CustomizationOption> findAll() {
        return customizationOptionRepository.findAll();
    }

    public Optional<CustomizationOption> findById(Long id) {
        return customizationOptionRepository.findById(id);
    }

    public CustomizationOption save(CustomizationOption option) {
        return customizationOptionRepository.save(option);
    }

    public void deleteById(Long id) {
        customizationOptionRepository.deleteById(id);
    }
}
