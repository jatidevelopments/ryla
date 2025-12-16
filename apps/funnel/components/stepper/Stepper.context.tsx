"use client";

import { createContext, useContext, PropsWithChildren } from "react";

export type StepperProps = {
    value: number;
    onChange: (stepIndex: number) => void;
    max: number;
    nextStep: () => void;
    prevStep: () => void;
    classNames?: {
        root?: string;
        content?: string;
        contents?: string;
        completed?: string;
    };
};

export const StepperContext = createContext<StepperProps | null>(null);

export function StepperContextProvider({ children, ...props }: PropsWithChildren<StepperProps>) {
    return <StepperContext.Provider value={{ ...props }}>{children}</StepperContext.Provider>;
}

export function useStepperContext() {
    const context = useContext(StepperContext);

    if (!context) {
        throw new Error("useStepperContext must be used within StepperContextProvider");
    }

    return context;
}
