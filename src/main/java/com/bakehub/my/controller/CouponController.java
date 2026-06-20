package com.bakehub.my.controller;

import com.bakehub.my.entity.Coupon;
import com.bakehub.my.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @GetMapping("/api/coupons")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        List<Coupon> all = couponRepository.findAll();
        return ResponseEntity.ok(all.stream().filter(c -> Boolean.TRUE.equals(c.getActive())).toList());
    }

    @PostMapping("/admin/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(saved);
    }
}
