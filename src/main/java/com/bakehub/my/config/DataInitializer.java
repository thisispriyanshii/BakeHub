package com.bakehub.my.config;

import com.bakehub.my.entity.Category;
import com.bakehub.my.entity.CustomizationOption;
import com.bakehub.my.entity.Product;
import com.bakehub.my.repository.CategoryRepository;
import com.bakehub.my.repository.CustomizationOptionRepository;
import com.bakehub.my.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedCustomizationData(
            CustomizationOptionRepository customizationOptionRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE order_items MODIFY COLUMN customization_details TEXT;");
            } catch (Exception e) {
                System.out.println("Schema migration info: " + e.getMessage());
            }

            if (customizationOptionRepository.count() == 0) {
                seedOptions(customizationOptionRepository);
            } else {
                cleanupOccasionOptions(customizationOptionRepository);
                seedOccasions(customizationOptionRepository);
            }

            if (productRepository.findByName("Custom Cake").isEmpty()) {
                Category category = categoryRepository.findAll().stream()
                        .filter(item -> "Custom Cakes".equalsIgnoreCase(item.getName()))
                        .findFirst()
                        .orElseGet(() -> {
                            Category newCategory = new Category();
                            newCategory.setName("Custom Cakes");
                            newCategory.setDescription("Design your own celebration cake");
                            return categoryRepository.save(newCategory);
                        });

                Product customCake = new Product(
                        "Custom Cake",
                        1.0,
                        category,
                        "/images/custom-cake.png"
                );
                customCake.setDescription("Design your own celebration cake");
                customCake.setCalories(1200);
                productRepository.save(customCake);
            }
        };
    }

    private void seedOptions(CustomizationOptionRepository repository) {
        String[][] occasions = {
                {"Birthday", "occasion", "0"},
                {"Anniversary", "occasion", "0"},
                {"Other", "occasion", "0"}
        };

        String[][] shapes = {
                {"Round", "shape", "0"},
                {"Square", "shape", "0"},
                {"Heart", "shape", "0"},
                {"Rectangle", "shape", "0"}
        };

        String[][] flavors = {
                {"Chocolate Truffle", "flavor", "0"},
                {"Red Velvet", "flavor", "0"},
                {"Black Forest", "flavor", "0"},
                {"Butterscotch", "flavor", "0"},
                {"Vanilla", "flavor", "0"},
                {"Blueberry", "flavor", "0"},
                {"Strawberry", "flavor", "0"}
        };

        String[][] weights = {
                {"0.5 Kg", "weight", "899"},
                {"1 Kg", "weight", "1299"},
                {"1.5 Kg", "weight", "1599"},
                {"2 Kg", "weight", "1899"},
                {"3 Kg", "weight", "2399"}
        };

        String[][] frostings = {
                {"Buttercream", "frosting", "0"},
                {"Whipped Cream", "frosting", "0"},
                {"Fondant", "frosting", "0"},
                {"Semi-Naked", "frosting", "0"},
                {"Drip Cake", "frosting", "0"}
        };

        String[][] toppings = {
                {"Extra Chocolate", "topping", "120"},
                {"Fresh Fruits", "topping", "100"},
                {"Gold Foil", "topping", "220"},
                {"Macarons", "topping", "140"},
                {"Sprinkles", "topping", "60"}
        };

        saveGroup(repository, occasions);
        saveGroup(repository, shapes);
        saveGroup(repository, flavors);
        saveGroup(repository, weights);
        saveGroup(repository, frostings);
        saveGroup(repository, toppings);
    }

    private void seedOccasions(CustomizationOptionRepository repository) {
        String[][] occasions = {
                {"Birthday", "occasion", "0"},
                {"Anniversary", "occasion", "0"},
                {"Other", "occasion", "0"}
        };
        saveGroup(repository, occasions);
    }

    private void cleanupOccasionOptions(CustomizationOptionRepository repository) {
        repository.deleteByType("occasion");
    }

    private void saveGroup(CustomizationOptionRepository repository, String[][] options) {
        for (String[] option : options) {
            CustomizationOption customizationOption = new CustomizationOption();
            customizationOption.setName(option[0]);
            customizationOption.setType(option[1]);
            customizationOption.setPriceModifier(Double.parseDouble(option[2]));
            repository.save(customizationOption);
        }
    }
}
