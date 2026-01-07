package org.example.service;


import org.example.dto.BetCouponDto;

public interface CouponService {
    BetCouponDto addSelectionToCoupon(Long userId, Long oddId);
    BetCouponDto getCoupon(Long userId);
    void clearCoupon(Long userId);
}
