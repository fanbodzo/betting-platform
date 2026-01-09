import { apiClient } from "./apiClient";

export type LoginResponse = { token: string };

export async function loginApi(username: string, password: string) {
    const res = await apiClient.post<LoginResponse>("/api/auth/login", { username, password });
    return res.data;
}