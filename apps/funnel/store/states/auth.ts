import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface IAuthState {
    userId: number | null;
    authToken: string | null;
    setToken(token: string): void;
    setUserId(userId: number): void;
    reset(): void;
}

export const useAuthStore = create<IAuthState>()(
    persist(
        immer((set) => ({
            userId: null,
            authToken: null,
            setToken: (token) =>
                set((state) => {
                    state.authToken = token;
                }),
            setUserId: (user) =>
                set((state) => {
                    state.userId = user;
                }),
            reset: () =>
                set((state) => {
                    state.userId = null;
                    state.authToken = null;
                }),
        })),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                userId: state.userId,
                authToken: state.authToken,
            }),
        },
    ),
);

export const getAuthStore = () => {
  return useAuthStore.getState();
};
