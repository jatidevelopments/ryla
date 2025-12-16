"use client";

import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_TATTOOS } from "@/constants/influencer-tattoos";
import { getTattooImage } from "@/utils/helpers/getInfluencerImage";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

export function InfluencerTattoosStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const tattoos = form.watch("influencer_tattoos");

    const options = INFLUENCER_TATTOOS.map((tattoo) => ({
        id: tattoo.id,
        value: tattoo.value,
        image: {
            ...tattoo.image,
            src: getTattooImage(tattoo.value) || tattoo.image.src,
        },
    }));

    const handleTattoosSelect = (value: string) => {
        form.setValue("influencer_tattoos", value, {
            shouldValidate: true,
        });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Tattoos',
            step_index: 21,
            option_type: 'influencer_tattoos',
            option_value: value,
        });
    };

    const handleTattoosSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleTattoosSelect,
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Tattoos
                    </h2>
                    <p className="text-white/90 text-base font-medium mb-8 px-4 text-center">
                        Select tattoo style for your AI Influencer
                    </p>

                    <div className="w-full mb-8">
                        <div className="grid grid-cols-2 gap-[10px] w-full">
                            {options.map((option) => (
                                <ImageCard
                                    key={option.id}
                                    image={option.image}
                                    isActive={tattoos === option.value}
                                    className="aspect-[159/128] w-full"
                                    onClick={() => handleTattoosSelectWithAutoAdvance(option.value)}
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        {form.formState.errors.influencer_tattoos && (
                            <div className="text-red-500 text-sm font-medium mt-2">
                                {form.formState.errors.influencer_tattoos.message}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!tattoos}
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
