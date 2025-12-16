import { useFormContext } from "react-hook-form";
import ImageCard from "@/components/ImageCard";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_ASS_SIZES } from "@/constants/influencer-ass-sizes";
import { INFLUENCER_BREAST_TYPES } from "@/constants/influencer-breast-types";

export function AdvancedCustomizationStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const ass_size = form.watch("influencer_ass_size");
    const breast_type = form.watch("influencer_breast_type");

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>
                    <h2 className="text-white text-lg font-bold mb-5 capitalize text-center">
                        Advanced Customization
                    </h2>
                    <p className="text-white/70 text-base font-medium mb-5 text-center">
                        Change outfits, and styles with one Click instead of Long prompt
                    </p>

                    <div className="w-full mb-8">
                        <h3 className="text-white text-base font-semibold mb-[7px] capitalize">
                            Ass Size
                        </h3>
                        <div className="grid grid-cols-2 gap-[10px] w-full">
                            {INFLUENCER_ASS_SIZES.map((size) => (
                                <ImageCard
                                    key={size.id}
                                    image={size.image}
                                    isActive={ass_size === size.value}
                                    className="aspect-[159/128] w-full"
                                    onClick={() =>
                                        form.setValue("influencer_ass_size", size.value, {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <ImageCard.Image className="object-cover object-[center_79%]" />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        {form.formState.errors.influencer_ass_size && (
                            <div className="text-red-500 text-sm font-medium mt-2">
                                {form.formState.errors.influencer_ass_size.message}
                            </div>
                        )}
                    </div>

                    <div className="w-full">
                        <h3 className="text-white text-base font-semibold mb-[7px] capitalize">
                            Breast Type
                        </h3>
                        <div className="grid grid-cols-3 gap-[10px] w-full">
                            {INFLUENCER_BREAST_TYPES.map((type) => (
                                <ImageCard
                                    key={type.id}
                                    image={type.image}
                                    isActive={breast_type === type.value}
                                    className="aspect-[110/95] w-full"
                                    onClick={() =>
                                        form.setValue("influencer_breast_type", type.value, {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <ImageCard.Image />
                                    <ImageCard.Name />
                                    <ImageCard.Overlay />
                                </ImageCard>
                            ))}
                        </div>
                        {form.formState.errors.influencer_breast_type && (
                            <div className="text-red-500 text-sm font-medium mt-2">
                                {form.formState.errors.influencer_breast_type.message}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            disabled={!ass_size || !breast_type}
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
