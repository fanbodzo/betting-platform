import { apiClient } from "./apiClient";

export async function addBalance(userId: number, amount: number) {
    const res = await apiClient.post(`/api/v1/users/${userId}/balance/add`, null, {
        params: { amount },
    });
    return res.data;
}

export async function deductBalance(userId: number, amount: number) {
    const res = await apiClient.post(`/api/v1/users/${userId}/balance/deduct`, null, {
        params: { amount },
    });
    return res.data;
}
