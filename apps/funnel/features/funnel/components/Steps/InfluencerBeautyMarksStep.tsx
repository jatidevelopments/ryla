"use client";

import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_SKIN_FEATURES } from "@/constants/influencer-skin-features";
import { getSkinFeatureImage } from "@/utils/helpers/getInfluencerImage";
import { ImageOptionsGrid, type ImageOption } from "@/components/ui/ImageOptionsGrid";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

export function InfluencerBeautyMarksStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const beautyMarks = form.watch("influencer_beauty_marks");

    const options = INFLUENCER_SKIN_FEATURES.beautyMarks.map((option): ImageOption => ({
        id: option.id,
        value: option.value,
        image: {
            ...option.image,
            src: getSkinFeatureImage("beauty-marks", option.value) || option.image.src,
        },
    }));

    const handleBeautyMarksSelect = (value: string) => {
        form.setValue("influencer_beauty_marks", value, { shouldValidate: true });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Beauty Marks',
            step_index: 15,
            option_type: 'influencer_beauty_marks',
            option_value: value,
        });
    };

    const handleBeautyMarksSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleBeautyMarksSelect
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Beauty Marks
                    </h2>
                    <p className="text-white/90 text-base font-medium mb-8 px-4 text-center">
                        Select beauty marks for your AI influencer
                    </p>

                    <ImageOptionsGrid
                        options={options}
                        renderOption={(option) => (
                            <ImageCard
                                image={option.image}
                                isActive={beautyMarks === option.value}
                                className="aspect-square w-full"
                                onClick={() => handleBeautyMarksSelectWithAutoAdvance(option.value)}
                            >
                                <ImageCard.Image />
                                <ImageCard.Name />
                                <ImageCard.Overlay />
                            </ImageCard>
                        )}
                    />

                    {form.formState.errors.influencer_beauty_marks && (
                        <div className="text-red-500 text-sm font-medium mt-2 text-center">
                            {form.formState.errors.influencer_beauty_marks.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!beautyMarks}
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

