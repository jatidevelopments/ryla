import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface IUtmState {
    utm: Record<string, string>;
    set(utm: Record<string, string>): void;
    merge(utm: Record<string, string>): void;
    reset(): void;
}

export const useUtmStore = create<IUtmState>()(
    persist(
        immer((set) => ({
            utm: {},
            set: (utm) =>
                set((state) => {
                    state.utm = utm;
                }),
            merge: (utm) =>
                set((state) => {
                    state.utm = {
                        ...state.utm,
                        ...utm,
                    };
                }),
            reset: () =>
                set((state) => {
                    state.utm = {};
                }),
        })),
        {
            name: "utm-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                utm: state.utm,
            }),
        },
    ),
);

export const getUtmStore = () => {
    return useUtmStore.getState();
};
