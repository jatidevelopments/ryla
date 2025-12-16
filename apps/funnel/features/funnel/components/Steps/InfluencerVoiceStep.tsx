"use client";

import { useFormContext } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_VOICES } from "@/constants/influencer-voices";
import { cn } from "@/lib/utils";
import { Volume2, Play } from "lucide-react";
import Image from "next/image";
import { useAutoAdvanceOnSingleOption } from "@/hooks/useAutoAdvanceOnSingleOption";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

export function InfluencerVoiceStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    const influencer_voice = form.watch("influencer_voice");

    const options = INFLUENCER_VOICES.map((voice) => ({
        id: voice.id,
        value: voice.value,
    }));

    const playVoice = (voiceId: string, voiceUrl: string, autoPlay = false) => {
        // Stop any currently playing audio
        Object.values(audioRefs.current).forEach((audio) => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        // Get or create audio element
        if (!audioRefs.current[voiceId]) {
            const audio = new Audio(voiceUrl);
            audioRefs.current[voiceId] = audio;
            
            audio.onended = () => {
                setPlayingVoice(null);
            };
        }

        const audio = audioRefs.current[voiceId];
        
        if (!autoPlay && playingVoice === voiceId && !audio.paused) {
            // If already playing and not auto-play, stop it
            audio.pause();
            audio.currentTime = 0;
            setPlayingVoice(null);
        } else {
            // Play the voice
            audio.currentTime = 0; // Reset to start
            audio.play().catch((error) => {
                console.error("Error playing audio:", error);
            });
            setPlayingVoice(voiceId);
        }
    };

    const handleVoiceSelect = (voiceValue: string) => {
        // Set the form value
        if (form) {
            form.setValue("influencer_voice", voiceValue, {
                shouldValidate: true,
            });
            
            // PostHog tracking - Option selected
            safePostHogCapture('funnel_option_selected', {
                step_name: 'Choose Voice',
                step_index: 24,
                option_type: 'influencer_voice',
                option_value: voiceValue,
            });
        }
    };

    const handleVoiceSelectWithAutoAdvance = useAutoAdvanceOnSingleOption(
        options,
        handleVoiceSelect
    );

    const handleVoiceSelectAndPlay = (voiceValue: string, voiceUrl: string) => {
        handleVoiceSelectWithAutoAdvance(voiceValue);
        // Auto-play voice when selected
        playVoice(voiceValue, voiceUrl, true);
    };

    // Stop all audio when component unmounts (user navigates away)
    useEffect(() => {
        return () => {
            // Cleanup: stop all playing audio when navigating away
            Object.values(audioRefs.current).forEach((audio) => {
                if (audio && !audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            setPlayingVoice(null);
        };
    }, []);

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
                    
                    {/* Main heading with gradient text */}
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-2xl sm:text-3xl font-extrabold mb-4 capitalize text-center leading-tight">
                        Choose Voice
                    </h2>
                    
                    {/* Sub-text */}
                    <p className="text-white/90 text-base sm:text-lg font-medium mb-8 px-4 text-center">
                        Select the perfect voice for your AI influencer
                    </p>

                    {/* Voice Options - Single column layout for 3 voices */}
                    <div className="w-full space-y-3 mb-6">
                        {INFLUENCER_VOICES.map((voice) => {
                            const isSelected = influencer_voice === voice.value;
                            const isPlaying = playingVoice === voice.value;

                            return (
                                <div
                                    key={voice.id}
                                    onClick={() => handleVoiceSelectAndPlay(voice.value, voice.voiceUrl)}
                                    className={cn(
                                        "w-full relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden",
                                        isSelected
                                            ? "bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                                            : "bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-black/30 border-2 border-white/10 hover:border-white/30 hover:from-white/[0.12] hover:via-white/[0.05]",
                                    )}
                                >
                                    {/* Shimmer effect when selected */}
                                    {isSelected && (
                                        <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-transparent via-white/30 via-transparent to-transparent pointer-events-none z-10" />
                                    )}
                                    <div className="p-4 flex items-center gap-4 relative z-0">
                                        {/* Voice Icon with gradient */}
                                        <div
                                            className={cn(
                                                "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300",
                                                isSelected
                                                    ? "bg-gradient-to-br from-purple-500 to-pink-500 scale-110 ring-2 ring-purple-400/50"
                                                    : "bg-gradient-to-br from-white/10 to-white/5 group-hover:scale-105",
                                            )}
                                        >
                                            {isPlaying ? (
                                                <Volume2 className="w-6 h-6 text-white animate-pulse" />
                                            ) : (
                                                <Image
                                                    src="/icons/voice-icon.svg"
                                                    alt="Voice Icon"
                                                    width={24}
                                                    height={24}
                                                    sizes="24px"
                                                    loading="lazy"
                                                    quality={85}
                                                    className="w-6 h-6 invert brightness-0 opacity-90"
                                                />
                                            )}
                                        </div>

                                        {/* Voice Label */}
                                        <div className="flex-1 text-left">
                                            <p
                                                className={cn(
                                                    "text-base font-bold transition-colors",
                                                    isSelected ? "text-white" : "text-white/90 group-hover:text-white",
                                                )}
                                            >
                                                {voice.label}
                                            </p>
                                        </div>

                                        {/* Play Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                playVoice(voice.value, voice.voiceUrl, false);
                                            }}
                                            className={cn(
                                                "p-2 rounded-lg transition-all duration-300 flex items-center justify-center",
                                                isSelected
                                                    ? "bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30"
                                                    : "bg-white/5 hover:bg-white/10 border border-white/10",
                                            )}
                                            aria-label={`Play ${voice.label} voice`}
                                        >
                                            <Play
                                                className={cn(
                                                    "w-4 h-4 transition-colors",
                                                    isPlaying ? "text-purple-400" : "text-white/70 group-hover:text-white",
                                                )}
                                            />
                                        </button>

                                        {/* Selection Indicator */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50 animate-pulse" />
                                        )}
                                    </div>

                                    {/* Glow effect on hover */}
                                    <div className="absolute -inset-1 bg-primary-gradient/20 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
                                </div>
                            );
                        })}
                    </div>

                    {/* Additional info text */}
                    <div className="w-full px-4 mb-8">
                        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                            <p className="text-white/90 text-xs text-center font-medium">
                                You can choose from{" "}
                                <span className="text-purple-400 font-semibold">50+ voices</span> later
                            </p>
                        </div>
                    </div>

                    {form?.formState?.errors?.influencer_voice && (
                        <div className="text-red-500 text-sm font-medium mt-2">
                            {form.formState.errors.influencer_voice.message}
                        </div>
                    )}
                </div>

                {/* Enhanced bottom section */}
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100 backdrop-blur-sm border-t border-white/5">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={() => {
                                // Stop all audio before navigating to next step
                                Object.values(audioRefs.current).forEach((audio) => {
                                    if (audio && !audio.paused) {
                                        audio.pause();
                                        audio.currentTime = 0;
                                    }
                                });
                                setPlayingVoice(null);
                                nextStep();
                            }}
                            disabled={!influencer_voice}
                            className="w-full h-[50px] bg-primary-gradient hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="relative z-10 text-base font-bold">Continue</span>
                        </Button>
                        <p className="text-white/60 text-xs font-medium text-center mt-4 flex items-center justify-center gap-2">
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                            Bring your AI influencer to life with the perfect voice
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
