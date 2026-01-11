import { apiClient } from "./apiClient";

export type UserDto = {
    userId: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    cashBalance?: number;
    bonusBalance?: number;
    roles?: string[];
};

export async function getUsers() {
    const res = await apiClient.get<UserDto[]>("/api/v1/users");
    return res.data;
}

export async function getBalance(userId: number) {
    const res = await apiClient.get(`/api/v1/users/${userId}/balance`);
    return res.data;
}
