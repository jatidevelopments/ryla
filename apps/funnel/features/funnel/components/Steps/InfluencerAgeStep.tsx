"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_AGE_RANGES } from "@/constants/influencer-age";
import { getAgeRangeImage } from "@/utils/helpers/getInfluencerImage";
import { cn } from "@/lib/utils";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

// Best converting option for age range
const BEST_CONVERTING_AGE_RANGE = "18-25";

export function InfluencerAgeStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const influencer_age = form.watch("influencer_age") as number;
    const influencer_ethnicity = form.watch("influencer_ethnicity");
    const [selectedRange, setSelectedRange] = useState<typeof INFLUENCER_AGE_RANGES[0] | null>(null);

    // Find which range contains the current age, or use selectedRange
    const currentRange = useMemo(() => {
        if (selectedRange) return selectedRange;
        if (influencer_age > 0) {
            return INFLUENCER_AGE_RANGES.find(
                (range) => influencer_age >= range.min && influencer_age <= range.max
            ) || null;
        }
        return null;
    }, [influencer_age, selectedRange]);

    // Calculate slider value (ensure it's within the selected range)
    const sliderValue = useMemo(() => {
        if (!currentRange) return 21;
        if (influencer_age > 0 && influencer_age >= currentRange.min && influencer_age <= currentRange.max) {
            return influencer_age;
        }
        // Default to middle of range
        return Math.round((currentRange.min + currentRange.max) / 2);
    }, [currentRange, influencer_age]);

    const handleRangeSelect = (range: typeof INFLUENCER_AGE_RANGES[0]) => {
        setSelectedRange(range);
        // Set age to middle of range when range is selected
        const middleAge = Math.round((range.min + range.max) / 2);
        form.setValue("influencer_age", middleAge, { shouldValidate: true });
        
        // PostHog tracking
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Choose Age',
            step_index: 6,
            option_type: 'age_range',
            option_value: range.value || range.image.name,
            age_min: range.min,
            age_max: range.max,
            age_set: middleAge,
        });
    };

    const handleSliderChange = (value: number[]) => {
        const age = value[0];
        form.setValue("influencer_age", age, { shouldValidate: true });
        
        // PostHog tracking
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Choose Age',
            step_index: 6,
            option_type: 'age_slider',
            age_value: age,
        });
    };

    const canContinue = influencer_age > 0 && currentRange !== null;

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Choose Age
                    </h2>
                    <p className="text-white/90 text-base font-medium text-center mb-8 px-4">
                        Select the age for your AI Influencer
                    </p>

                    {/* Age Range Selection */}
                    <div className="w-full grid grid-cols-2 gap-[10px] mb-6">
                        {INFLUENCER_AGE_RANGES.map((range) => {
                            const isActive = currentRange?.id === range.id;
                            // Get ethnicity-specific image if ethnicity is selected, otherwise use default
                            const imageSrc = influencer_ethnicity
                                ? getAgeRangeImage(influencer_ethnicity, range.value) || range.image.src
                                : range.image.src;
                            
                            const isBest = range.value === BEST_CONVERTING_AGE_RANGE;
                            
                            return (
                                <ImageCard
                                    key={range.id}
                                    image={{
                                        ...range.image,
                                        src: imageSrc,
                                    }}
                                    isActive={isActive}
                                    onClick={() => handleRangeSelect(range)}
                                    className="w-full h-auto aspect-square relative"
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                    
                                    {/* Best Converting Badge */}
                                    {isBest && (
                                        <div
                                            className={cn(
                                                "absolute top-2 right-2 z-20 px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg",
                                                "backdrop-blur-sm border",
                                                "bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-white border-green-400/50"
                                            )}
                                        >
                                            Best Converting
                                        </div>
                                    )}
                                </ImageCard>
                            );
                        })}
                    </div>

                    {/* Slider - Shows immediately when range is selected */}
                    {currentRange && (
                        <div className="w-full space-y-4">
                            <div className="text-center">
                                <div className="text-white/70 text-sm font-medium mb-2">
                                    Selected Range: <span className="text-white font-semibold">{currentRange.value}</span>
                                </div>
                                <div className="text-white text-3xl font-bold">
                                    {sliderValue} years old
                                </div>
                            </div>
                            <div className="w-full px-2">
                                <Slider
                                    value={[sliderValue]}
                                    onValueChange={handleSliderChange}
                                    min={currentRange.min}
                                    max={currentRange.max}
                                    step={1}
                                    className="w-full [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-primary-gradient [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-white/50 [&_[data-slot=slider-thumb]]:size-5"
                                />
                            </div>
                            <div className="flex justify-between text-white/50 text-xs px-2">
                                <span>{currentRange.min}</span>
                                <span>{currentRange.max}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!canContinue}
                            className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Continue</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Build your AI influencer step by step
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
