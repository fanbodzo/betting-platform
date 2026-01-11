import { apiClient } from "./apiClient";

export type CouponSelection = {
    oddId: number;
    eventName: string;
    marketName: string;
    outcomeName: string;
    oddValue: number;
    marketId: number;
};

export type CouponDto = {
    selections: CouponSelection[];
    totalOdd: number;
    numberOfSelections: number;
};

export async function getCoupon(userId: number) {
    const res = await apiClient.get<CouponDto>(`/api/v1/coupon/${userId}`);
    return res.data;
}

export async function clearCoupon(userId: number) {
    const res = await apiClient.delete(`/api/v1/coupon/${userId}`);
    return res.data;
}

export async function addToCoupon(userId: number, oddId: number) {
    const res = await apiClient.post(`/api/v1/coupon/${userId}/add`, { oddId });
    return res.data;
}