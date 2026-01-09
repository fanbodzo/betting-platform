import { apiClient } from "./apiClient";

export async function getBets(userId: number, status: string = "PENDING") {
    const res = await apiClient.get(`/api/v1/bets/${userId}`, {
        params: { status },
    });
    return res.data;
}