import { apiClient } from "./apiClient";

export type LoginResponse = { token: string };

export async function loginApi(username: string, password: string) {
    const res = await apiClient.post<LoginResponse>("/api/auth/login", { username, password });
    return res.data;
}

export type RegisterRequest = {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    personalIdNumber: string;
};

export async function registerApi(payload: RegisterRequest) {
    const res = await apiClient.post("/api/auth/register", payload);
    return res.data;
}
