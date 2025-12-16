import axios from "axios";
import { getAuthStore } from "@/store/states/auth";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://devapi.mydreamcompanion.com",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = getAuthStore().authToken;
            if (token && token.trim()) {
                try {
                    config.headers.Authorization = `Bearer ${token}`;
                } catch (error) {
                    console.warn("Invalid token format:", error);
                    localStorage.removeItem("token");
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.status, error.response.statusText);

            if (error.response.status === 401) {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                }
            }
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;
