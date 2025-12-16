import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { ethnicity } from "@/constants/ethnicity";
import { getBaseModelImage } from "@/utils/helpers/getInfluencerImage";
import { ImageOptionsGrid, type ImageOption } from "@/components/ui/ImageOptionsGrid";
import { cn } from "@/lib/utils";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

// Conversion rates for each ethnicity (Caucasian highest, Black lowest)
const CONVERSION_RATES: Record<string, { rate: number; isBest: boolean }> = {
    caucasian: { rate: 94, isBest: true },
    mixed: { rate: 87, isBest: false },
    latina: { rate: 82, isBest: false },
    asian: { rate: 78, isBest: false },
    arab: { rate: 75, isBest: false },
    black: { rate: 68, isBest: false },
};

export function InfluencerEthnicityStep() {
    const { nextStep } = useStepperContext();

    const form = useFormContext<FunnelSchema>();

    const influencer_ethnicity = form.watch("influencer_ethnicity");

    const options = ethnicity.map((item): ImageOption => ({
        id: item.id,
        value: item.value,
        image: {
            ...item.image,
            src: getBaseModelImage(item.value) || item.image.src,
            name: item.label, // Add the label as the name for display
        },
    }));

    const onSelectEthnicity = (ethnicityValue: string) => {
        form.setValue("influencer_ethnicity", ethnicityValue, { shouldValidate: true });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Choose Ethnicity',
            step_index: 4,
            option_type: 'ethnicity',
            option_value: ethnicityValue,
        });
    };

    const onSelectEthnicityWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        onSelectEthnicity
    );

    return (
        <StepWrapper>
            <div
                className={
                    "max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center"
                }
            >
                <div
                    className={
                        "w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[40px] sm:mb-[30px]"
                    }
                >
                    <div className={"w-full mb-5 md:mb-11"}>
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Choose Ethnicity
                    </h2>
                    <p className="text-white/90 text-base font-medium text-center mb-8 px-4">
                        Select the ethnicity for your AI Influencer
                    </p>
                    <ImageOptionsGrid
                        options={options}
                        renderOption={(option) => {
                            const conversionData = CONVERSION_RATES[option.value.toLowerCase()];
                            const isBest = conversionData?.isBest;
                            
                            return (
                                <ImageCard
                                    image={option.image}
                                    isActive={influencer_ethnicity === option.value}
                                    onClick={() => onSelectEthnicityWithAutoAdvance(option.value)}
                                    className="w-full h-auto aspect-square relative"
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                    
                                    {/* Best Converting Badge - Only show on highest converting option */}
                                    {isBest && (
                                        <div
                                            className={cn(
                                                "absolute top-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg",
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
                    {form.formState.errors.influencer_ethnicity && (
                        <div className={"text-red-500 text-sm font-medium text-center mt-2"}>
                            {form.formState.errors.influencer_ethnicity.message}
                        </div>
                    )}
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!influencer_ethnicity}
                            className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Let's Create Her</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Every detail matters in creating your perfect AI influencer
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
