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

    public List<CustomizationOption> findByType(String type) {
        return customizationOptionRepository.findByType(type);
    }

    public double getPriceModifier(String name, String type) {
        return customizationOptionRepository.findByNameAndType(name, type)
                .map(CustomizationOption::getPriceModifier)
                .orElse(0.0);
    }

    public double calculateCustomCakePrice(String weight, List<String> toppings) {
        double total = getPriceModifier(weight, "weight");
        if (total <= 0) {
            total = 1299.0;
        }

        if (toppings != null) {
            for (String topping : toppings) {
                total += getPriceModifier(topping, "topping");
            }
        }

        return total;
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
