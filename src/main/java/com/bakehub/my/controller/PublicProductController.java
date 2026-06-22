package com.bakehub.my.controller;

import com.bakehub.my.entity.Product;
import com.bakehub.my.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products")
public class PublicProductController {

    @Autowired
    private ProductService productService;
    @Autowired
    private com.bakehub.my.service.S3Service s3Service;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.findAll();
        for (Product p : products) {
            try {
                String key = p.getImageUrl();
                if (key != null && !key.isBlank() && !key.startsWith("http")) {
                    String url = s3Service.generatePresignedUrl(key);
                    p.setImageUrl(url);
                }
            } catch (Exception ignored) {
                // if presign fails, return product without changing image
            }
        }
        return ResponseEntity.ok(products);
    }
}
