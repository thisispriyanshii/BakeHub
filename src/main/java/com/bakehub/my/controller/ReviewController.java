package com.bakehub.my.controller;

import com.bakehub.my.entity.Review;
import com.bakehub.my.repository.ReviewRepository;
import com.bakehub.my.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Review> submitReview(Authentication authentication, @RequestBody Review payload) {
        // associate user
        userRepository.findByEmail(authentication.getName()).ifPresent(payload::setUser);
        Review saved = reviewRepository.save(payload);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Review>> fetchReviews(@RequestParam(defaultValue = "3.5") double minRating,
                                                     @RequestParam(defaultValue = "10") int limit) {
        List<Review> reviews = reviewRepository.findTopByMinRating(minRating, PageRequest.of(0, limit));
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Review>> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(reviewRepository.findByOrderId(orderId));
    }
}
