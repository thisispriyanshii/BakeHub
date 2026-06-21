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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.findAll();
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@Valid @RequestBody Product product) {
        Product savedProduct = productService.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        if (!productService.existsById(id)) {
            throw new ProductNotFoundException(id);
        }

        product.setId(id);
        Product updatedProduct = productService.save(product);
        return ResponseEntity.ok(updatedProduct);
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

        String uploadDir = "uploads";
        Files.createDirectories(Paths.get(uploadDir));

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path target = Paths.get(uploadDir).resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String url = "/api/uploads/" + filename;
        Map<String, String> resp = new HashMap<>();
        resp.put("url", url);
        return ResponseEntity.ok(resp);
    }
}
