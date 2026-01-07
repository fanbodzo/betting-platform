package org.example.controller;


import lombok.RequiredArgsConstructor;
import org.example.dto.AddSelectionRequestDto;
import org.example.dto.BetCouponDto;
import org.example.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/coupon")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @GetMapping("/{userId}")
    public ResponseEntity<BetCouponDto> getCouponByUserId(@PathVariable Long userId) {
        BetCouponDto coupon = couponService.getCoupon(userId);
        return ResponseEntity.ok(coupon);
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<BetCouponDto> addSelection(@PathVariable Long userId , @RequestBody AddSelectionRequestDto request) {
        BetCouponDto updatedCoupon = couponService.addSelectionToCoupon(userId, request.getOddId());
        return ResponseEntity.ok(updatedCoupon);
    }
    @DeleteMapping("/{userId}")
    public ResponseEntity<BetCouponDto> deleteSelection(@PathVariable Long userId){
        couponService.clearCoupon(userId);
        return ResponseEntity.noContent().build();
    }
}
