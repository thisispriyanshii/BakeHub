package com.bakehub.my.repository;

import com.bakehub.my.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByOrderId(Long orderId);

    @Query("SELECT r FROM Review r WHERE r.rating >= :minRating ORDER BY r.createdAt DESC")
    List<Review> findTopByMinRating(@Param("minRating") double minRating, org.springframework.data.domain.Pageable pageable);
}
