"use client";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { Video } from "@/components/ui/video";
import { cn } from "@/lib/utils";
import { RylaBadge } from "@/components/RylaBadge";

export function CustomizeOutfitStep() {
    const { nextStep } = useStepperContext();

    const handleClick = () => {
        console.log("CustomizeOutfitStep: Button clicked, calling nextStep");
        try {
            nextStep();
        } catch (error) {
            console.error("CustomizeOutfitStep: Error calling nextStep", error);
        }
    };

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-0">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>

                    <h2 className="text-white text-xl md:text-2xl font-bold mb-8 capitalize text-center">
                        Change outfits and styles with{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                            one click
                        </span>{" "}
                        instead of long prompts
                    </h2>

                    {/* Video Container */}
                    <div className="w-full mb-8 flex justify-center">
                        <div
                            className={cn(
                                "relative w-full max-w-[280px] aspect-[9/16] rounded-2xl overflow-hidden",
                                "border-2 border-purple-400/50",
                                "bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-black/30",
                                "shadow-2xl shadow-purple-500/30",
                                "transition-all hover:border-purple-400/70 hover:shadow-purple-500/40"
                            )}
                        >
                            <Video
                                src="/video/ai_influencer_outfit_1.mp4"
                                className="w-full h-full"
                                objectFit="cover"
                                aspectRatio="9/16"
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls={false}
                                loading="lazy"
                                quality="high"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent pointer-events-none" />
                            
                            {/* "Ryla.ai" Badge */}
                            <RylaBadge position="bottom-right" />
                        </div>
                    </div>

                    {/* Comparison highlight */}
                    <div className="w-full flex justify-center mb-0">
                        <div className="w-full max-w-[280px] px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20">
                            <p className="text-white/90 text-xs text-center font-medium">
                                <span className="text-purple-400 font-semibold">Switch styles</span> instantly
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button 
                            onClick={handleClick} 
                            className="w-full h-[45px] bg-primary-gradient relative overflow-hidden group"
                            type="button"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Activate Outfit Customization</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            You can change this anytime
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
