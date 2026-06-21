package com.bakehub.my.controller;

import com.bakehub.my.entity.Coupon;
import com.bakehub.my.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping("/api/coupons")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        expireExpiredCoupons();
        LocalDate today = LocalDate.now();
        List<Coupon> all = couponRepository.findAll();
        return ResponseEntity.ok(all.stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .filter(c -> c.getExpiresAt() == null || !today.isAfter(c.getExpiresAt()))
                .toList());
    }

    private void expireExpiredCoupons() {
        LocalDate today = LocalDate.now();
        List<Coupon> expiredCoupons = couponRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .filter(c -> c.getExpiresAt() != null && today.isAfter(c.getExpiresAt()))
                .toList();

        if (!expiredCoupons.isEmpty()) {
            expiredCoupons.forEach(c -> c.setActive(false));
            couponRepository.saveAll(expiredCoupons);
        }
    }

    @PostMapping("/admin/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(saved);
    }
}
