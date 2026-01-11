import { apiClient } from "./apiClient";

export async function getBets(userId: number, status: string = "PENDING") {
    const res = await apiClient.get(`/api/v1/bets/${userId}`, { params: { status } });
    return res.data;
}

export async function placeBet(userId: number, stake: number) {
    const res = await apiClient.post(`/api/v1/bets/${userId}`, { stake });
    return res.data;
}
