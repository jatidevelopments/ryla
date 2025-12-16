"use client";

import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_SKIN_FEATURES } from "@/constants/influencer-skin-features";
import { useDynamicOptions } from "@/hooks/useDynamicOptions";
import { useAutoReset } from "@/hooks/useAutoReset";
import { getSkinFeatureImage } from "@/utils/helpers/getInfluencerImage";
import { cn } from "@/lib/utils";

export function InfluencerSkinFeaturesStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const freckles = form.watch("influencer_freckles");
    const scars = form.watch("influencer_scars");
    const beautyMarks = form.watch("influencer_beauty_marks");

    // Use dynamic options hook for freckles (ethnicity and skin color aware)
    const filteredFreckles = useDynamicOptions(
        "influencer_freckles",
        INFLUENCER_SKIN_FEATURES.freckles,
    );

    // Auto-reset when dependencies change
    useAutoReset();

    const handleFrecklesSelect = (value: string) => {
        form.setValue("influencer_freckles", value, { shouldValidate: true });
    };

    const handleScarsSelect = (value: string) => {
        form.setValue("influencer_scars", value, { shouldValidate: true });
    };

    const handleBeautyMarksSelect = (value: string) => {
        form.setValue("influencer_beauty_marks", value, { shouldValidate: true });
    };

    const canContinue = freckles && scars && beautyMarks;

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-white text-lg font-bold mb-5 capitalize text-center">
                        Skin Features
                    </h2>
                    <p className="text-white/70 text-base font-medium mb-5 text-center">
                        Customize skin characteristics for your AI influencer
                    </p>

                    <div className="w-full space-y-6 mb-8">
                        {/* Freckles */}
                        <div className="w-full">
                            <h3 className="text-white text-base font-semibold mb-[7px] capitalize">
                                Freckles
                            </h3>
                            <div className="grid grid-cols-4 gap-[10px] w-full">
                                {filteredFreckles.map(({ option, disabled, disabledReason }) => {
                                    // Get skin feature image if available, otherwise use default
                                    const imageSrc = getSkinFeatureImage("freckles", option.value) || option.image.src;
                                    
                                    return (
                                        <ImageCard
                                            key={option.id}
                                            image={{
                                                ...option.image,
                                                src: imageSrc,
                                            }}
                                            isActive={freckles === option.value}
                                            className={cn(
                                                "aspect-[159/128] w-full",
                                                disabled && "opacity-50 cursor-not-allowed",
                                            )}
                                            onClick={() => {
                                                if (!disabled) {
                                                    handleFrecklesSelect(option.value);
                                                }
                                            }}
                                            title={disabled ? disabledReason : undefined}
                                        >
                                            <ImageCard.Image />
                                            <ImageCard.Name />
                                            <ImageCard.Overlay />
                                        </ImageCard>
                                    );
                                })}
                            </div>
                            {form.formState.errors.influencer_freckles && (
                                <div className="text-red-500 text-sm font-medium mt-2">
                                    {form.formState.errors.influencer_freckles.message}
                                </div>
                            )}
                        </div>

                        {/* Scars */}
                        <div className="w-full">
                            <h3 className="text-white text-base font-semibold mb-[7px] capitalize">
                                Scars
                            </h3>
                            <div className="grid grid-cols-4 gap-[10px] w-full">
                                {INFLUENCER_SKIN_FEATURES.scars.map((option) => {
                                    // Get skin feature image if available, otherwise use default
                                    const imageSrc = getSkinFeatureImage("scars", option.value) || option.image.src;
                                    
                                    return (
                                        <ImageCard
                                            key={option.id}
                                            image={{
                                                ...option.image,
                                                src: imageSrc,
                                            }}
                                            isActive={scars === option.value}
                                            className="aspect-[159/128] w-full"
                                            onClick={() => handleScarsSelect(option.value)}
                                        >
                                            <ImageCard.Image />
                                            <ImageCard.Name />
                                            <ImageCard.Overlay />
                                        </ImageCard>
                                    );
                                })}
                            </div>
                            {form.formState.errors.influencer_scars && (
                                <div className="text-red-500 text-sm font-medium mt-2">
                                    {form.formState.errors.influencer_scars.message}
                                </div>
                            )}
                        </div>

                        {/* Beauty Marks */}
                        <div className="w-full">
                            <h3 className="text-white text-base font-semibold mb-[7px] capitalize">
                                Beauty Marks
                            </h3>
                            <div className="grid grid-cols-3 gap-[10px] w-full">
                                {INFLUENCER_SKIN_FEATURES.beautyMarks.map((option) => {
                                    // Get skin feature image if available, otherwise use default
                                    const imageSrc = getSkinFeatureImage("beauty-marks", option.value) || option.image.src;
                                    
                                    return (
                                        <ImageCard
                                            key={option.id}
                                            image={{
                                                ...option.image,
                                                src: imageSrc,
                                            }}
                                            isActive={beautyMarks === option.value}
                                            className="aspect-[110/95] w-full"
                                            onClick={() => handleBeautyMarksSelect(option.value)}
                                        >
                                            <ImageCard.Image />
                                            <ImageCard.Name />
                                            <ImageCard.Overlay />
                                        </ImageCard>
                                    );
                                })}
                            </div>
                            {form.formState.errors.influencer_beauty_marks && (
                                <div className="text-red-500 text-sm font-medium mt-2">
                                    {form.formState.errors.influencer_beauty_marks.message}
                                </div>
                            )}
                        </div>
                    </div>
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
                            Fine-tune every aspect of your AI influencer
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
