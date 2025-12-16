"use client";

import { useFormContext } from "react-hook-form";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { getOutfitImage } from "@/utils/helpers/getInfluencerImage";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { OutfitCard } from "./OutfitCard";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

// Popular influencer outfit options
const OUTFIT_OPTIONS = [
    { id: "outfit-1", value: "athleisure_set", name: "Athleisure Set" },
    { id: "outfit-2", value: "casual_streetwear", name: "Casual Streetwear" },
    { id: "outfit-3", value: "business_casual", name: "Business Casual" },
    { id: "outfit-4", value: "boho_maxi_dress", name: "Boho Maxi Dress" },
    { id: "outfit-5", value: "y2k_revival", name: "Y2K Revival" },
    { id: "outfit-6", value: "date_night_glam", name: "Date Night Glam" },
    { id: "outfit-7", value: "elevated_basics", name: "Elevated Basics" },
    { id: "outfit-8", value: "summer_chic", name: "Summer Chic" },
    { id: "outfit-9", value: "casual_denim", name: "Casual Denim" },
];

export function ChooseOutfitStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const selectedOutfit = form.watch("influencer_outfit");

    const options = OUTFIT_OPTIONS.map((outfit) => ({
        id: outfit.id,
        value: outfit.value,
        image: {
            src: getOutfitImage(outfit.value) || "",
            alt: outfit.name,
            name: outfit.name,
        },
    }));

    const handleOutfitSelect = (outfitValue: string) => {
        form.setValue("influencer_outfit", outfitValue, { shouldValidate: true });
        
        // PostHog tracking - Option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'Choose Outfit',
            step_index: 18,
            option_type: 'influencer_outfit',
            option_value: outfitValue,
        });
    };

    const handleOutfitSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleOutfitSelect
    );

    const handleCustomizeLater = () => {
        nextStep();
    };

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-4 md:mb-8">
                        <Stepper.Progress />
                    </div>

                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
                        Choose Outfit
                    </h2>
                    <p className="text-white/90 text-base font-medium text-center mb-8 px-4">
                        You can change this later
                    </p>

                    <div className="w-full mb-6 px-4">
                        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                            <div className="grid grid-cols-3 gap-3">
                                {options.map((option) => {
                                    const isSelected = selectedOutfit === option.value;
                                
                                return (
                                        <OutfitCard
                                            key={option.id}
                                        image={option.image}
                                            isActive={isSelected}
                                        onClick={() => handleOutfitSelectWithAutoAdvance(option.value)}
                                        />
                                    );
                                })}
                            </div>
                                            </div>
                    </div>

                    <div className="w-full flex justify-center mb-6 px-4">
                        <div className="w-full max-w-[280px] px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20">
                            <p className="text-white/90 text-xs text-center font-medium">
                                <span className="text-purple-400 font-semibold">100+ more outfit options</span> available • Create custom outfits
                        </p>
                        </div>
                    </div>
                </div>

                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full space-y-3">
                        {selectedOutfit && (
                            <Button
                                onClick={nextStep}
                                className="w-full h-[45px] bg-primary-gradient relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                                <span className="text-base font-bold relative z-10">Let's style Her Up</span>
                            </Button>
                        )}
                        <Button
                            onClick={handleCustomizeLater}
                            className="w-full h-[45px] bg-white/10 hover:bg-white/20 border border-white/20"
                        >
                            <span className="text-base font-bold text-white">Customize later</span>
                        </Button>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
