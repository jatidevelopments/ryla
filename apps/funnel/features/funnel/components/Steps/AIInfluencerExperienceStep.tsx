"use client";

import { useFormContext } from "react-hook-form";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

const experienceOptions = [
    {
        value: "never_created",
        label: "I never created an AI Influencer yet",
        icon: "/icons/magic-wand-icon.svg",
        gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
        value: "recently_launched",
        label: "I have launched an AI Influencer recently",
        icon: "/icons/rating-star.svg",
        gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
        value: "multiple_running",
        label: "I have multiple AI Influencers running",
        icon: "/icons/fire-icon.svg",
        gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
    },
];

export function AIInfluencerExperienceStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const selectedExperience = form.watch("ai_influencer_experience");

    const options = experienceOptions.map((option) => ({
        id: option.value,
        value: option.value,
    }));

    const handleExperienceSelect = (value: string) => {
        form.setValue("ai_influencer_experience", value, { shouldValidate: true });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'AI Influencer Experience',
            step_index: 2,
            option_type: 'ai_influencer_experience',
            option_value: value,
        });
    };

    const handleExperienceSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleExperienceSelect
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>

                    <div className="text-center mb-6 px-4">
                        <h2 className="text-white/70 text-sm font-medium mb-2">
                            Tell us about your experience
                        </h2>
                        <p className="text-white text-2xl font-bold">AI Influencer Experience</p>
                    </div>

                    <div className="w-full flex flex-col gap-3 mb-6 px-4">
                        {experienceOptions.map((option) => {
                            const isSelected = selectedExperience === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleExperienceSelectWithAutoAdvance(option.value)}
                                    className={cn(
                                        "relative w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left overflow-hidden",
                                        isSelected
                                            ? "border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20"
                                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                                    )}
                                >
                                    {/* Shimmer effect when selected */}
                                    {isSelected && (
                                        <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-transparent via-white/30 via-transparent to-transparent pointer-events-none z-10" />
                                    )}
                                    <div className="flex items-center gap-4 relative z-0">
                                        <div
                                            className={cn(
                                                "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200",
                                                option.gradient,
                                                isSelected ? "scale-110" : "",
                                            )}
                                        >
                                            <Image
                                                src={option.icon}
                                                alt={option.label}
                                                width={28}
                                                height={28}
                                                className="w-7 h-7 invert brightness-0 opacity-90"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p
                                                className={cn(
                                                    "text-base font-bold",
                                                    isSelected ? "text-white" : "text-white/90",
                                                )}
                                            >
                                                {option.label}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 14 14"
                                                    fill="none"
                                                >
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
                            );
                        })}
                    </div>

                    {form.formState.errors.ai_influencer_experience && (
                        <div className="text-red-500 text-sm font-medium text-center mt-4 px-4">
                            {form.formState.errors.ai_influencer_experience.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!selectedExperience}
                            className="w-full h-[45px] bg-primary-gradient hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Let's Do This</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Help us personalize your experience
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

