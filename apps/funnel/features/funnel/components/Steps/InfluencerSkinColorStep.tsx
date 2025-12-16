import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_SKIN_COLORS } from "@/constants/influencer-skin-colors";
import { useDynamicOptions } from "@/hooks/useDynamicOptions";
import { useAutoReset } from "@/hooks/useAutoReset";
import { getInfluencerImage } from "@/utils/helpers/getInfluencerImage";
import { cn } from "@/lib/utils";
import { ImageOptionsGrid, type ImageOption } from "@/components/ui/ImageOptionsGrid";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

// Best converting option for skin color
const BEST_CONVERTING_SKIN_COLOR = "medium";

export function InfluencerSkinColorStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const influencer_skin_color = form.watch("influencer_skin_color");
    const influencer_ethnicity = form.watch("influencer_ethnicity");

    // Use dynamic options hook for ethnicity-based filtering
    const filteredOptions = useDynamicOptions("influencer_skin_color", INFLUENCER_SKIN_COLORS);

    // Auto-reset when ethnicity changes
    useAutoReset();

    const handleSkinColorSelect = (value: string) => {
        form.setValue("influencer_skin_color", value, {
            shouldValidate: true,
        });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Choose Skin Color',
            step_index: 7,
            option_type: 'influencer_skin_color',
            option_value: value,
        });
    };

    const options = filteredOptions.map(({ option, disabled, disabledReason }): ImageOption => ({
        id: option.id,
        value: option.value,
        image: {
            ...option.image,
            src: influencer_ethnicity
                ? getInfluencerImage("skin-colors", influencer_ethnicity, option.value) || option.image.src
                : option.image.src,
        },
        disabled,
        disabledReason,
    }));

    const handleSkinColorSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleSkinColorSelect
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Choose Skin Color
                    </h2>
                    <p className="text-white/90 text-base font-medium text-center mb-8 px-4">
                        Select the skin color for your AI Influencer
                    </p>

                    <ImageOptionsGrid
                        options={options}
                        renderOption={(option) => {
                            const isBest = option.value === BEST_CONVERTING_SKIN_COLOR;
                            
                            return (
                                <ImageCard
                                    image={option.image}
                                    isActive={influencer_skin_color === option.value}
                                    onClick={() => {
                                        if (!option.disabled) {
                                            handleSkinColorSelectWithAutoAdvance(option.value);
                                        }
                                    }}
                                    className={cn(
                                        "w-full h-auto aspect-square relative",
                                        option.disabled && "opacity-50 cursor-not-allowed",
                                    )}
                                    title={option.disabled ? option.disabledReason : undefined}
                                >
                                    <ImageCard.Image />
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
                    {form.formState.errors.influencer_skin_color && (
                        <div className="text-red-500 text-sm font-medium mt-2">
                            {form.formState.errors.influencer_skin_color.message}
                        </div>
                    )}
                </div>

                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!influencer_skin_color}
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
