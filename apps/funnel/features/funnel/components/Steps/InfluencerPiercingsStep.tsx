"use client";

import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_PIERCINGS } from "@/constants/influencer-piercings";
import { getPiercingImage } from "@/utils/helpers/getInfluencerImage";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

export function InfluencerPiercingsStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const piercings = form.watch("influencer_piercings");

    const options = INFLUENCER_PIERCINGS.map((piercing) => ({
        id: piercing.id,
        value: piercing.value,
        image: {
            ...piercing.image,
            src: getPiercingImage(piercing.value) || piercing.image.src,
        },
    }));

    const handlePiercingsSelect = (value: string) => {
        form.setValue("influencer_piercings", value, {
            shouldValidate: true,
        });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Piercings',
            step_index: 20,
            option_type: 'influencer_piercings',
            option_value: value,
        });
    };

    const handlePiercingsSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handlePiercingsSelect,
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Piercings
                    </h2>
                    <p className="text-white/90 text-base font-medium mb-8 px-4 text-center">
                        Select piercing style for your AI Influencer
                    </p>

                    <div className="w-full mb-8">
                        <div className="grid grid-cols-3 gap-[10px] w-full">
                            {options.map((option) => (
                                <ImageCard
                                    key={option.id}
                                    image={option.image}
                                    isActive={piercings === option.value}
                                    className="aspect-[110/95] w-full"
                                    onClick={() =>
                                        handlePiercingsSelectWithAutoAdvance(option.value)
                                    }
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        {form.formState.errors.influencer_piercings && (
                            <div className="text-red-500 text-sm font-medium mt-2">
                                {form.formState.errors.influencer_piercings.message}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!piercings}
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
