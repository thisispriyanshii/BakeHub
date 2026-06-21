package com.bakehub.my.repository;

import com.bakehub.my.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
	long countByProduct_Id(Long productId);
}
