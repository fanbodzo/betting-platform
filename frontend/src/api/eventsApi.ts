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

/** ADMIN: POST /api/v1/admin/events */
export type CreateEventRequest = {
    eventName: string;
    startTime: string; // np. "2026-01-11T17:30:00"
};

export async function adminCreateEvent(payload: CreateEventRequest) {
    const res = await apiClient.post("/api/v1/admin/events", payload);
    return res.data;
}

/** DELETE /api/v1/events/{id} */
export async function deleteEventById(eventId: number) {
    const res = await apiClient.delete(`/api/v1/events/${eventId}`);
    return res.data;
}
