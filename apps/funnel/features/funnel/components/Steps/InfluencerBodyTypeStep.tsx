import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_BODY_TYPES } from "@/constants/influencer-body-types";
import { cn } from "@/lib/utils";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

// Best converting option for body type
const BEST_CONVERTING_BODY_TYPE = "athletic";

export function InfluencerBodyTypeStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const body_type = form.watch("influencer_body_type");

    const options = INFLUENCER_BODY_TYPES.map((type) => ({
        id: type.id,
        value: type.value,
        image: type.image,
    }));

    const handleBodyTypeSelect = (value: string) => {
        form.setValue("influencer_body_type", value, { shouldValidate: true });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Body Type',
            step_index: 17,
            option_type: 'influencer_body_type',
            option_value: value,
        });
    };

    const handleBodyTypeSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleBodyTypeSelect
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-4 md:mb-8">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Body Type
                    </h2>
                    <p className="text-white/90 text-base font-medium text-center mb-8 px-4">
                        Select the body type for your AI Influencer
                    </p>

                    <div className="w-full grid grid-cols-2 gap-[10px]">
                        {options.map((option) => {
                            const isBest = option.value === BEST_CONVERTING_BODY_TYPE;
                            
                            return (
                                <ImageCard
                                    key={option.id}
                                    image={option.image}
                                    isActive={body_type === option.value}
                                    onClick={() => handleBodyTypeSelectWithAutoAdvance(option.value)}
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
                </div>

                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!body_type}
                            className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Continue</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            One step closer to your perfect AI influencer
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
