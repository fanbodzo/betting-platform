import axios from "axios";

export const apiClient = axios.create({
    baseURL: "http://74.249.43.156:9000",
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
