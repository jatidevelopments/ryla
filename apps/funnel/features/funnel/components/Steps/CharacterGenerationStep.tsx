"use client";

import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { useLoader } from "@/features/funnel/hooks/useLoader";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import StepWrapper from "@/components/layouts/StepWrapper";
import Stepper from "@/components/stepper";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";
import { getStepIndexByName } from "@/features/funnel/config/steps";

export function CharacterGenerationStep() {
    const { nextStep, value: currentStepIndex } = useStepperContext();
    const CHARACTER_GENERATION_STEP_INDEX = getStepIndexByName("Character Generation") ?? 30;
    const [showContinueButton, setShowContinueButton] = useState(false);
    const hasAdvancedRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const progressCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const mainLoader = useLoader(0, 99, 20);
    const generationLoader = useLoader(0, 100, 15);

    // Reset state when component mounts (handles navigation back to this step)
    useEffect(() => {
        console.log("CharacterGenerationStep mounted/reset - resetting all state");
        // Reset all state when component mounts
        hasAdvancedRef.current = false;
        setShowContinueButton(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (progressCheckIntervalRef.current) {
            clearInterval(progressCheckIntervalRef.current);
            progressCheckIntervalRef.current = null;
        }
        if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = null;
        }
        
        // Cleanup function to ensure we reset on unmount too
        return () => {
            console.log("CharacterGenerationStep unmounting - cleaning up");
            hasAdvancedRef.current = false;
            setShowContinueButton(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (progressCheckIntervalRef.current) {
                clearInterval(progressCheckIntervalRef.current);
                progressCheckIntervalRef.current = null;
            }
            if (maxTimeoutRef.current) {
                clearTimeout(maxTimeoutRef.current);
                maxTimeoutRef.current = null;
            }
        };
    }, []); // Only run on mount

    const advanceToNextStep = () => {
        // Always allow advance if we're still on the Character Generation step
        // This handles cases where hasAdvancedRef is set but navigation didn't happen
        // (e.g., after reload, step switching, or isNavigating flag blocking)
        if (hasAdvancedRef.current && currentStepIndex !== CHARACTER_GENERATION_STEP_INDEX) {
            console.log("Already advanced to different step, ignoring duplicate call");
            return;
        }
        
        // If we're still on this step, allow the advance even if hasAdvancedRef is true
        if (currentStepIndex === CHARACTER_GENERATION_STEP_INDEX) {
            hasAdvancedRef.current = true;
            
            // PostHog tracking - Character generation completed
            safePostHogCapture('character_generation_completed', {
                step_name: 'Character Generation',
                step_index: CHARACTER_GENERATION_STEP_INDEX,
            });

            // Small delay to ensure UI updates are visible before transition
            setTimeout(() => {
                nextStep();
            }, 300);
        } else {
            console.log("Not on Character Generation step, navigation already occurred");
        }
    };

    useEffect(() => {
        // PostHog tracking - Character generation started
        safePostHogCapture('character_generation_started', {
            step_name: 'Character Generation',
            step_index: 30,
        });

        // Start both loaders and automatically advance when complete
        const mainPromise = mainLoader.start();
        const generationPromise = generationLoader.start();
        
        // Set a maximum timeout fallback: automatically advance after 10 seconds total
        maxTimeoutRef.current = setTimeout(() => {
            if (!hasAdvancedRef.current) {
                console.log("Maximum timeout reached, forcing advance to next step");
                advanceToNextStep();
            }
        }, 10000); // 10 seconds maximum

        Promise.all([mainPromise, generationPromise])
            .then(() => {
                if (maxTimeoutRef.current) {
                    clearTimeout(maxTimeoutRef.current);
                    maxTimeoutRef.current = null;
                }
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                if (progressCheckIntervalRef.current) {
                    clearInterval(progressCheckIntervalRef.current);
                    progressCheckIntervalRef.current = null;
                }
                console.log("Both loaders completed, advancing to next step");
                advanceToNextStep();
            })
            .catch((error) => {
                console.error("Error in character generation:", error);
                
                if (maxTimeoutRef.current) {
                    clearTimeout(maxTimeoutRef.current);
                    maxTimeoutRef.current = null;
                }
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                if (progressCheckIntervalRef.current) {
                    clearInterval(progressCheckIntervalRef.current);
                    progressCheckIntervalRef.current = null;
                }
                
                // PostHog tracking - Character generation failed
                safePostHogCapture('character_generation_failed', {
                    step_name: 'Character Generation',
                    step_index: 30,
                    error_message: error.message || 'Unknown error',
                });

                // Show continue button if error occurs
                setShowContinueButton(true);
            });

        // Additional safety check: monitor progress and ensure navigation happens
        progressCheckIntervalRef.current = setInterval(() => {
            // Access current progress values from the loaders
            const mainProgress = mainLoader.progress;
            const genProgress = generationLoader.progress;
            
            if (mainProgress >= 99 && genProgress >= 99 && !hasAdvancedRef.current) {
                console.log("Progress check: Both loaders at 99%+, forcing advance");
                if (progressCheckIntervalRef.current) {
                    clearInterval(progressCheckIntervalRef.current);
                    progressCheckIntervalRef.current = null;
                }
                if (maxTimeoutRef.current) {
                    clearTimeout(maxTimeoutRef.current);
                    maxTimeoutRef.current = null;
                }
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                advanceToNextStep();
            }
        }, 1000); // Check every second

        // Cleanup function
        return () => {
            if (maxTimeoutRef.current) {
                clearTimeout(maxTimeoutRef.current);
                maxTimeoutRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (progressCheckIntervalRef.current) {
                clearInterval(progressCheckIntervalRef.current);
                progressCheckIntervalRef.current = null;
            }
        };
    }, []); // Empty deps array - only run once on mount

    // Monitor progress and show continue button when reaching 99%
    useEffect(() => {
        if (mainLoader.progress >= 99 && !hasAdvancedRef.current) {
            // Try to advance automatically first
            const autoAdvanceTimeout = setTimeout(() => {
                if (!hasAdvancedRef.current && mainLoader.progress >= 99) {
                    console.log("Progress at 99%, attempting auto-advance");
                    advanceToNextStep();
                }
            }, 500); // Try auto-advance after 500ms at 99%

            // Show continue button as fallback after 1.5 seconds if still at 99%
            timeoutRef.current = setTimeout(() => {
                if (!hasAdvancedRef.current && mainLoader.progress >= 99) {
                    console.log("Progress at 99% for 1.5 seconds, showing continue button");
                    setShowContinueButton(true);
                }
            }, 1500);

            return () => {
                clearTimeout(autoAdvanceTimeout);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            };
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [mainLoader.progress]);

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center relative">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-gradient/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-40 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-300" />
                </div>

                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px] relative z-10">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>

                    {/* Main heading with gradient text */}
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-2xl sm:text-3xl font-extrabold mb-8 capitalize text-center leading-tight">
                        Characters Gets Generated
                    </h2>

                    {/* Main progress card */}
                    <div className="relative w-full h-auto aspect-[360/485] rounded-xl overflow-hidden mb-6 group">
                        <Image
                            src="/images/banners/first-loader-placeholder.webp"
                            alt="AI Influencer Preview"
                            fill
                            className="object-cover blur-[20px] scale-110"
                            style={{ objectFit: "cover" }}
                        />

                        {/* Overlay with gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-gradient/20 to-purple-500/20 opacity-50" />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 border border-white/10 rounded-xl" />

                        {/* Progress content */}
                        <div className="absolute inset-0 px-[20px] py-[25px] flex flex-col items-center justify-center">
                            <div className="w-full">
                                {/* Large percentage */}
                                <p className="text-white text-[50px] sm:text-[60px] font-extrabold leading-none text-center mb-3 drop-shadow-lg">
                                    {Math.trunc(mainLoader.progress)}%
                                </p>
                                
                                {/* Please Wait text */}
                                <p className="text-white/90 text-[24px] sm:text-[28px] font-bold leading-none text-center mb-6">
                                    Please Wait!
                                </p>
                                
                                {/* Progress bar */}
                                <div className="mb-4">
                                    <Progress
                                        value={mainLoader.progress}
                                        className="h-[6px] bg-black/40 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden"
                                        indicatorProps={{ 
                                            className: "bg-primary-gradient shadow-lg shadow-purple-500/50" 
                                        }}
                                    />
                                </div>
                                
                                {/* Status message */}
                                <p className="text-white/80 text-sm sm:text-base font-medium text-center">
                                    Creating your perfect AI influencer...
                                </p>
                            </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-primary-gradient/20 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300 -z-10" />
                    </div>

                    {/* Bottom progress bar */}
                    <div className="w-full relative">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white/80 text-sm font-medium">
                                Generating AI Influencer to your preferences
                            </span>
                            <span className="text-white font-bold text-sm">
                                {Math.trunc(generationLoader.progress)}%
                            </span>
                        </div>
                        <div className="relative">
                            <Progress 
                                value={generationLoader.progress} 
                                className="h-[6px] bg-black/40 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden"
                                indicatorProps={{ 
                                    className: "bg-primary-gradient shadow-lg shadow-purple-500/50" 
                                }}
                            />
                            {/* Animated pulse effect */}
                            <div className="absolute inset-0 bg-primary-gradient/20 rounded-full animate-pulse" />
                        </div>
                    </div>

                    {/* Continue button - shown when progress reaches 99% or after timeout */}
                    {showContinueButton && (
                        <div className="w-full mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <Button
                                onClick={advanceToNextStep}
                                className="w-full h-[55px] bg-primary-gradient text-white font-bold text-base uppercase rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] transition-all duration-300"
                            >
                                Continue
                            </Button>
                        </div>
                    )}
                </div>

                {/* Fixed footer continue button - shown when progress reaches 99% as fallback */}
                {(mainLoader.progress >= 99 || generationLoader.progress >= 99) && !hasAdvancedRef.current && (
                    <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-4 bg-black-2 fixed bottom-0 left-0 z-[120] sm:static sm:z-auto border-t border-white/5 backdrop-blur-md">
                        <div className="max-w-[450px] w-full">
                            <Button
                                onClick={advanceToNextStep}
                                className="w-full h-[55px] bg-primary-gradient text-white font-bold text-base uppercase rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                                <span className="relative z-10">Continue</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </StepWrapper>
    );
}
