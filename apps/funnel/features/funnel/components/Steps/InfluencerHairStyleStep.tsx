import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_HAIR_STYLES } from "@/constants/influencer-hair-styles";
import { INFLUENCER_HAIR_COLORS } from "@/constants/influencer-hair-colors";
import { useDynamicOptions } from "@/hooks/useDynamicOptions";
import { useAutoReset } from "@/hooks/useAutoReset";
import { getInfluencerImage } from "@/utils/helpers/getInfluencerImage";
import { cn } from "@/lib/utils";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

// Best converting options for hair
const BEST_CONVERTING_HAIR_STYLE = "long";
const BEST_CONVERTING_HAIR_COLOR = "brunette";

export function InfluencerHairStyleStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const hair_style = form.watch("influencer_hair_style");
    const hair_color = form.watch("influencer_hair_color");
    const influencer_ethnicity = form.watch("influencer_ethnicity");

    // Use dynamic options hook for ethnicity-based filtering
    const filteredStyles = useDynamicOptions("influencer_hair_style", INFLUENCER_HAIR_STYLES);
    const filteredColors = useDynamicOptions("influencer_hair_color", INFLUENCER_HAIR_COLORS);

    // Auto-reset when ethnicity changes
    useAutoReset();

    const handleHairStyleSelect = (value: string) => {
        form.setValue("influencer_hair_style", value, {
            shouldValidate: true,
        });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Hair Style & Color',
            step_index: 10,
            option_type: 'influencer_hair_style',
            option_value: value,
        });
    };

    const handleHairColorSelect = (value: string) => {
        form.setValue("influencer_hair_color", value, {
            shouldValidate: true,
        });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Hair Style & Color',
            step_index: 10,
            option_type: 'influencer_hair_color',
            option_value: value,
        });
    };

    const styleOptions = filteredStyles.map(({ option, disabled, disabledReason }) => ({
        id: option.id,
        value: option.value,
        image: {
            ...option.image,
            src: influencer_ethnicity
                ? getInfluencerImage("hair-styles", influencer_ethnicity, option.value) || option.image.src
                : option.image.src,
        },
        disabled,
        disabledReason,
    }));

    const colorOptions = filteredColors.map(({ option, disabled, disabledReason }) => ({
        id: option.id,
        value: option.value,
        image: {
            ...option.image,
            src: influencer_ethnicity
                ? getInfluencerImage("hair-colors", influencer_ethnicity, option.value) || option.image.src
                : option.image.src,
        },
        disabled,
        disabledReason,
    }));

    const handleHairStyleSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        styleOptions,
        handleHairStyleSelect
    );

    const handleHairColorSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        colorOptions,
        handleHairColorSelect
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Hair Style
                    </h2>
                    <div className="mb-4" />
                    <div className="w-full flex flex-col items-center gap-2 mb-5 md:mb-10">
                        <div className="w-full grid grid-cols-3 gap-[10px]">
                            {styleOptions.map((option) => {
                                const isBest = option.value === BEST_CONVERTING_HAIR_STYLE;
                                
                                return (
                                    <ImageCard
                                        key={option.id}
                                        image={option.image}
                                        isActive={hair_style === option.value}
                                        onClick={() => {
                                            if (!option.disabled) {
                                                handleHairStyleSelectWithAutoAdvance(option.value);
                                            }
                                        }}
                                        className={cn(
                                            "w-full h-auto aspect-square relative",
                                            option.disabled && "opacity-50 cursor-not-allowed",
                                        )}
                                        title={option.disabled ? option.disabledReason : undefined}
                                    >
                                        <ImageCard.Image className="object-top" />
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
                            })}
                        </div>
                        {form.formState.errors.influencer_hair_style && (
                            <div className="text-red-500 text-sm font-medium mt-2">
                                {form.formState.errors.influencer_hair_style.message}
                            </div>
                        )}
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">Hair Color</h2>
                    <div className="mb-4" />
                    <div className="w-full flex flex-col items-center gap-2">
                        <div className="w-full grid grid-cols-4 gap-[10px]">
                            {colorOptions.map((option) => {
                                const isBest = option.value === BEST_CONVERTING_HAIR_COLOR;
                                
                                return (
                                    <ImageCard
                                        key={option.id}
                                        image={option.image}
                                        isActive={hair_color === option.value}
                                        onClick={() => {
                                            if (!option.disabled) {
                                                handleHairColorSelectWithAutoAdvance(option.value);
                                            }
                                        }}
                                        className={cn(
                                            "w-full h-auto aspect-square relative",
                                            option.disabled && "opacity-50 cursor-not-allowed",
                                        )}
                                        title={option.disabled ? option.disabledReason : undefined}
                                    >
                                        <ImageCard.Image className="object-top" />
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
                            })}
                        </div>
                        {form.formState.errors.influencer_hair_color && (
                            <div className="text-red-500 text-sm font-medium mt-2">
                                {form.formState.errors.influencer_hair_color.message}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!hair_style || !hair_color}
                            className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Continue</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Customize every detail of your AI influencer
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
