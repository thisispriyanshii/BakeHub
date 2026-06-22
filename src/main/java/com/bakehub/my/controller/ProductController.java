package com.bakehub.my.controller;

import com.bakehub.my.entity.Product;
import com.bakehub.my.exception.ProductNotFoundException;
import com.bakehub.my.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;

import com.bakehub.my.service.S3Service;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/admin/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private com.bakehub.my.repository.OrderItemRepository orderItemRepository;

    @Autowired
    private S3Service s3Service;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.findAll();
        products.forEach(this::populateProductImageUrl);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@Valid @RequestBody Product product) {
        Product savedProduct = productService.save(product);
        populateProductImageUrl(savedProduct);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        if (!productService.existsById(id)) {
            throw new ProductNotFoundException(id);
        }

        product.setId(id);
        Product updatedProduct = productService.save(product);
        populateProductImageUrl(updatedProduct);
        return ResponseEntity.ok(updatedProduct);
    }

    private void populateProductImageUrl(Product product) {
        if (product == null) {
            return;
        }
        String key = product.getImageUrl();
        if (key != null && !key.isBlank() && !key.startsWith("http")) {
            try {
                String url = s3Service.generatePresignedUrl(key);
                product.setImageUrl(url);
            } catch (Exception ignored) {
                // keep the existing key if presign generation fails
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productService.existsById(id)) {
            throw new ProductNotFoundException(id);
        }

        // check for referencing order items to provide a clearer error message
        long refs = orderItemRepository.countByProduct_Id(id);
        if (refs > 0) {
            java.util.Map<String, String> body = new java.util.HashMap<>();
            body.put("message", "Product cannot be deleted: referenced by " + refs + " order items");
            return ResponseEntity.status(409).body(body);
        }

        try {
            productService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            java.util.Map<String, String> body = new java.util.HashMap<>();
            body.put("message", "Product cannot be deleted due to database constraints");
            return ResponseEntity.status(409).body(body);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        try {
            String key = s3Service.uploadFile(file);
            String url = s3Service.generatePresignedUrl(key);
            Map<String, String> resp = new HashMap<>();
            resp.put("url", url);
            resp.put("key", key);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}
