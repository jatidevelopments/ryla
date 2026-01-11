import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

export interface IFunnelState {
    form: FunnelSchema | null;
    step: number | null;
    setFormState(form: FunnelSchema): void;
    setStep(step: number): void;
    reset(): void;
}

export const useFunnelStore = create<IFunnelState>()(
    persist(
        immer((set) => ({
            form: null,
            step: null,
            setFormState: (form) =>
                set((state) => {
                    state.form = form;
                }),
            setStep: (step) =>
                set((state) => {
                    state.step = step;
                }),
            reset: () =>
                set((state) => {
                    state.form = null;
                    state.step = null;
                }),
        })),
        {
            name: "funnel-storage",
            storage: createJSONStorage(() =>
                typeof window !== "undefined" ? localStorage : {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                }
            ),
            partialize: (state) => ({
                form: state.form,
                step: state.step,
            }),
        },
    ),
);

export const getFunnelStore = () => {
    return useFunnelStore.getState();
};
