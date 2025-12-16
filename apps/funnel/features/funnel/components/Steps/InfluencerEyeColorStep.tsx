import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_EYES_COLORS } from "@/constants/influencer-eyes-colors";
import { useDynamicOptions } from "@/hooks/useDynamicOptions";
import { useAutoReset } from "@/hooks/useAutoReset";
import { getInfluencerImage } from "@/utils/helpers/getInfluencerImage";
import { cn } from "@/lib/utils";
import { ImageOptionsGrid, type ImageOption } from "@/components/ui/ImageOptionsGrid";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

// Best converting option for eye color
const BEST_CONVERTING_EYE_COLOR = "brown";

export function InfluencerEyeColorStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const eye_color = form.watch("influencer_eye_color");
    const influencer_ethnicity = form.watch("influencer_ethnicity");

    // Use dynamic options hook for ethnicity-based filtering
    const filteredOptions = useDynamicOptions("influencer_eye_color", INFLUENCER_EYES_COLORS);

    // Auto-reset when ethnicity changes
    useAutoReset();

    const handleEyeColorSelect = (value: string) => {
        form.setValue("influencer_eye_color", value, {
            shouldValidate: true,
        });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Choose Eye Color',
            step_index: 9,
            option_type: 'influencer_eye_color',
            option_value: value,
        });
    };

    const options = filteredOptions.map(({ option, disabled, disabledReason }): ImageOption => ({
        id: option.id,
        value: option.value,
        image: {
            ...option.image,
            src: influencer_ethnicity
                ? getInfluencerImage("eye-colors", influencer_ethnicity, option.value) || option.image.src
                : option.image.src,
        },
        disabled,
        disabledReason,
    }));

    const handleEyeColorSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleEyeColorSelect
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Choose Eye Color
                    </h2>
                    <p className="text-white/90 text-base font-medium text-center mb-8 px-4">
                        Select the eye color for your AI Influencer
                    </p>
                    <ImageOptionsGrid
                        options={options}
                        renderOption={(option) => {
                            const isBest = option.value === BEST_CONVERTING_EYE_COLOR;
                            
                            return (
                                <ImageCard
                                    image={option.image}
                                    isActive={eye_color === option.value}
                                    className={cn(
                                        "w-full h-auto aspect-square relative",
                                        option.disabled && "opacity-50 cursor-not-allowed",
                                    )}
                                    onClick={() => {
                                        if (!option.disabled) {
                                            handleEyeColorSelectWithAutoAdvance(option.value);
                                        }
                                    }}
                                    title={option.disabled ? option.disabledReason : undefined}
                                >
                                    <ImageCard.Image className="rounded-xl" />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                    
                                    {/* Best Converting Badge */}
                                    {isBest && !option.disabled && (
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
                        }}
                    />
                    {form.formState.errors.influencer_eye_color && (
                        <div className="text-red-500 text-sm font-medium mt-2">
                            {form.formState.errors.influencer_eye_color.message}
                        </div>
                    )}
                </div>

                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!eye_color}
                            className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Continue</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Create your perfect AI influencer one step at a time
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
