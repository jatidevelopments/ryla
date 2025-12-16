import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_FACE_SHAPES } from "@/constants/influencer-face-shapes";
import { getInfluencerImage } from "@/utils/helpers/getInfluencerImage";
import { cn } from "@/lib/utils";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

// Best converting option for face shape
const BEST_CONVERTING_FACE_SHAPE = "oval";

export function InfluencerFaceShapeStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const face_shape = form.watch("influencer_face_shape");
    const influencer_ethnicity = form.watch("influencer_ethnicity");

    const options = INFLUENCER_FACE_SHAPES.map((shape) => ({
        id: shape.id,
        value: shape.value,
        image: {
            ...shape.image,
            src: influencer_ethnicity
                ? getInfluencerImage("face-shapes", influencer_ethnicity, shape.value) || shape.image.src
                : shape.image.src,
        },
    }));

    const handleFaceShapeSelect = (value: string) => {
        form.setValue("influencer_face_shape", value, { shouldValidate: true });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Face Shape',
            step_index: 11,
            option_type: 'influencer_face_shape',
            option_value: value,
        });
    };

    const handleFaceShapeSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleFaceShapeSelect
    );

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Face Shape
                    </h2>
                    <p className="text-white/90 text-base font-medium text-center mb-8 px-4">
                        Select the face shape for your AI Influencer
                    </p>

                    <div className="w-full grid grid-cols-2 gap-[10px]">
                        {options.map((option) => {
                            const isBest = option.value === BEST_CONVERTING_FACE_SHAPE;
                            
                            return (
                                <ImageCard
                                    key={option.id}
                                    image={option.image}
                                    isActive={face_shape === option.value}
                                    onClick={() => handleFaceShapeSelectWithAutoAdvance(option.value)}
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
                            disabled={!face_shape}
                            className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Continue</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Your perfect AI influencer is taking shape
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
