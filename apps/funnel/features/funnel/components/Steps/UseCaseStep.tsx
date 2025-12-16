"use client";

import { useFormContext } from "react-hook-form";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import Image from "next/image";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

const useCaseOptions = [
    {
        value: "ai_onlyfans",
        label: "AI OnlyFans",
        icon: "/icons/heart-check-icon.svg",
        gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
        value: "ai_ugc",
        label: "AI UGC",
        icon: "/icons/recording-icon.svg",
        gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
        value: "ai_courses",
        label: "AI Courses",
        icon: "/icons/book-edit-icon.svg",
        gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
    },
    {
        value: "ai_influencer",
        label: "AI Influencer",
        icon: "/icons/rating-star.svg",
        gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
];

export function UseCaseStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const use_cases = form.watch("use_cases") || [];
    const isNotSure = use_cases.includes("not_sure_yet");

    const toggleUseCase = (value: string) => {
        // If clicking "Not sure yet", clear all other selections
        if (value === "not_sure_yet") {
            const isCurrentlySelected = use_cases.includes("not_sure_yet");
            form.setValue("use_cases", isCurrentlySelected ? [] : ["not_sure_yet"], { shouldValidate: true });
            
            // PostHog tracking
            safePostHogCapture('funnel_option_selected', {
                step_name: 'Use Case',
                step_index: 3,
                option_type: 'use_case',
                option_value: value,
                is_selected: !isCurrentlySelected,
            });
        } else {
            // If clicking a regular use case and "Not sure yet" is selected, clear it first
            let current = use_cases.filter((v) => v !== "not_sure_yet");
            const updated = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            form.setValue("use_cases", updated, { shouldValidate: true });
            
            // PostHog tracking
            safePostHogCapture('funnel_option_selected', {
                step_name: 'Use Case',
                step_index: 3,
                option_type: 'use_case',
                option_value: value,
                is_selected: updated.includes(value),
                total_selected: updated.length,
            });
        }
    };

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>

                    <div className="text-center mb-6 px-4">
                        <h2 className="text-white/70 text-sm font-medium mb-2">
                            Choose Your Use Case
                        </h2>
                        <p className="text-white text-2xl font-bold">What will you use this for?</p>
                    </div>

                    <div className="w-full flex flex-col gap-4 mb-6 px-4">
                        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
                            <p className="text-white/70 text-sm mb-4">
                                Select all that apply
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {useCaseOptions.map((option) => {
                                    const isSelected = use_cases.includes(option.value);
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => toggleUseCase(option.value)}
                                            className={`relative aspect-square rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                                                isSelected
                                                    ? "border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20"
                                                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                            }`}
                                        >
                                            {/* Shimmer effect when selected */}
                                            {isSelected && (
                                                <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-transparent via-white/30 via-transparent to-transparent pointer-events-none z-20" />
                                            )}
                                            {/* Icon Overlay */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                                                <div
                                                    className={`w-10 h-10 rounded-lg ${option.gradient} flex items-center justify-center shadow-md transition-transform duration-200 ${
                                                        isSelected ? "scale-110" : ""
                                                    }`}
                                                >
                                                    <Image
                                                        src={option.icon}
                                                        alt={option.label}
                                                        width={20}
                                                        height={20}
                                                        className="w-5 h-5 invert brightness-0 opacity-90"
                                                    />
                                                </div>
                                                <p
                                                    className={`text-sm font-medium ${
                                                        isSelected ? "text-white" : "text-white/90"
                                                    }`}
                                                >
                                                    {option.label}
                                                </p>
                                            </div>

                                            {/* Selection Indicator */}
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-20 shadow-md">
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 12 12"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M10 3L4.5 8.5L2 6"
                                                            stroke="white"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Not Sure Yet Toggle */}
                        <button
                            onClick={() => toggleUseCase("not_sure_yet")}
                            className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 ${
                                isNotSure
                                    ? "border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20"
                                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-14 h-14 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 ${
                                        isNotSure ? "scale-110" : ""
                                    }`}
                                >
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-white opacity-90"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <path d="M12 17h.01" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3
                                        className={`text-lg font-bold mb-1 ${
                                            isNotSure ? "text-white" : "text-white/90"
                                        }`}
                                    >
                                        Not sure yet
                                    </h3>
                                    <p
                                        className={`text-sm ${
                                            isNotSure ? "text-white/70" : "text-white/60"
                                        }`}
                                    >
                                        I'm still exploring options
                                    </p>
                                </div>
                                {isNotSure && (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path
                                                d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>

                    {form.formState.errors.use_cases && (
                        <div className="text-red-500 text-sm font-medium text-center mt-4 px-4">
                            {form.formState.errors.use_cases.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!use_cases.length}
                            className="w-full h-[45px] bg-primary-gradient hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Perfect, Let's Go</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            {isNotSure ? "Continue to explore your options" : "Select at least one use case to continue"}
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

