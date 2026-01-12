import { apiClient } from "./apiClient";

export async function settleMarket(marketId: number, winningOddId: number) {
    const res = await apiClient.post(`/api/v1/admin/settle/market/${marketId}`, {
        winningOddId,
    });
    return res.data;
}