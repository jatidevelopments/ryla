"use client";

import { useEffect, useRef } from "react";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { SafeSpriteIcon } from "@/components/ui/SafeSpriteIcon";
import { useFormContext } from "react-hook-form";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

export function NSFWContentPreviewStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const hasAutoAdvancedRef = useRef(false);
    
    // Reset auto-advance flag when component mounts (handles navigation back to this step)
    useEffect(() => {
        console.log("NSFWContentPreviewStep mounted/reset - resetting auto-advance flag");
        hasAutoAdvancedRef.current = false;
        
        return () => {
            console.log("NSFWContentPreviewStep unmounting - cleaning up");
            hasAutoAdvancedRef.current = false;
        };
    }, []);
    
    // Auto-skip this step if NSFW is disabled
    const enableNsfw = form.watch("enable_nsfw");
    useEffect(() => {
        if (enableNsfw === false && !hasAutoAdvancedRef.current) {
            // Only auto-advance once per mount to prevent issues when navigating back
            hasAutoAdvancedRef.current = true;
            console.log("NSFW disabled, auto-advancing to next step");
            // Small delay to ensure state is stable
            setTimeout(() => {
                nextStep();
            }, 100);
        }
    }, [enableNsfw, nextStep]);

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center relative">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-gradient/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-40 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
                </div>

                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px] relative z-10">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>

                    {/* Enhanced description with better styling */}
                    <div className="w-full mb-8">
                        <div className="relative">
                            {/* Main content box - no gradient effects */}
                            <div className="relative bg-gradient-to-br from-[#1a1625] via-[#28242E] to-[#1a1625] backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden">
                                {/* Subtle pattern overlay */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)`
                                    }} />
                                </div>
                                
                                {/* Content */}
                                <div className="relative z-10 space-y-3">
                                    {/* Main heading */}
                                    <div className="text-center space-y-2">
                                        <p className="text-white text-lg sm:text-xl font-bold leading-tight">
                                            We got you covered...
                                        </p>
                                        <p className="text-white text-xl sm:text-2xl font-extrabold leading-tight">
                                            Generate Spicy Images
                                        </p>
                                        <p className="text-white/80 text-sm sm:text-base font-semibold leading-tight">
                                            with high precision and Consistent Character
                                        </p>
                                    </div>
                                    
                                    {/* Divider */}
                                    <div className="flex items-center justify-center gap-2 py-2">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
                                    </div>
                                    
                                    {/* Tagline */}
                                    <p className="text-white/70 text-sm sm:text-base font-medium text-center italic">
                                        Exactly what you need in every Image...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Preview Images with gradient background */}
                    <div className="w-full mb-6 relative">
                        {/* Gradient background behind images */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl opacity-20 blur-2xl -z-10" />
                        <div className="absolute -inset-2 bg-primary-gradient/30 rounded-xl blur-lg opacity-40 -z-10" />
                        
                        <div className="relative">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <p className="text-transparent bg-clip-text bg-primary-gradient text-sm font-bold uppercase tracking-wider px-2">
                                    Visual Preview
                                </p>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {[
                                    "/character-assets/nfsw/nfsw_1.webp",
                                    "/character-assets/nfsw/nfsw2.webp",
                                    "/character-assets/nfsw/nsfw3.webp",
                                ].map((src, i) => (
                                    <div
                                        key={i}
                                        className="relative w-full rounded-lg border border-white/10 overflow-hidden"
                                    >
                                        {/* Image container with permanent blur */}
                                        <div className="relative w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <SafeSpriteIcon
                                                src={src}
                                                targetW={200}
                                                targetH={200}
                                                center={false}
                                                className="block max-w-full h-auto blur-md"
                                                style={{ 
                                                    width: '100%',
                                                    height: 'auto',
                                                    objectFit: 'contain',
                                                    display: 'block'
                                                }}
                                                description="Spicy content preview image"
                                                fallbackAlt={`Spicy Preview ${i + 1}`}
                                            />
                                        </div>
                                        
                                        {/* Permanent overlay */}
                                        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                                        
                                        {/* Border */}
                                        <div className="absolute inset-0 border border-white/10 rounded-lg pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced bottom section */}
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100 backdrop-blur-sm border-t border-white/5">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            className="w-full h-[50px] bg-primary-gradient hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 relative overflow-hidden group"
                        >
                            <span className="relative z-10 text-base font-bold">Unlock Spicy Content</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </Button>
                        <p className="text-white/60 text-xs font-medium text-center mt-4 flex items-center justify-center gap-2">
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                            Unlock unlimited content generation possibilities
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

export default NSFWContentPreviewStep;

