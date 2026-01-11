import { apiClient } from "./apiClient";

export type EventStatus = "CANCELLED" | "UPCOMING" | "FINISHED" | "LIVE";

export type OddDto = {
    oddId: number;
    outcomeName: string;
    oddValue: number;
};

export type MarketDto = {
    marketId: number;
    marketName: string;
    odds: OddDto[];
};

export type EventDto = {
    eventId: number;
    eventName: string;
    startTime: string;
    markets: MarketDto[];
};

export async function getEvents(status: EventStatus) {
    const res = await apiClient.get<EventDto[]>("/api/v1/events", {
        params: { status },
    });
    return res.data;
}
