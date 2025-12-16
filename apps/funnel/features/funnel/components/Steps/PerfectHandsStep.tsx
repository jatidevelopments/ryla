"use client";

import Image from "next/image";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RylaBadge } from "@/components/RylaBadge";

export function PerfectHandsStep() {
    const { nextStep } = useStepperContext();

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>

                    <h2 className="text-white text-xl md:text-2xl font-bold mb-8 capitalize text-center">
                        Perfect fingers and Hands on every generated Image{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                            in Ryla.ai
                        </span>
                    </h2>

                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                        {/* Bad Hands Card */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "relative w-full aspect-square rounded-2xl mb-3 overflow-hidden",
                                    "border-2 border-white/10",
                                    "bg-gradient-to-br from-white/5 via-white/2 to-black/30",
                                    "shadow-lg shadow-black/20",
                                    "transition-all hover:border-white/20 hover:shadow-xl",
                                )}
                            >
                                <Image
                                    src="/mdc-images/hands-comparison/bad-hands.webp"
                                    alt="Typical AI-generated hands showing deformed fingers and unnatural proportions"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 200px"
                                    loading="lazy"
                                    quality={85}
                                />
                                {/* Subtle overlay for contrast */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                            </div>
                            <div className="text-center">
                                <p className="text-white/80 text-sm font-semibold mb-1">
                                    Bad Hands
                                </p>
                                <p className="text-white/50 text-xs">Typical AI</p>
                            </div>
                        </div>

                        {/* Perfect Hands Card - Highlighted */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "relative w-full aspect-square rounded-2xl mb-3 overflow-hidden",
                                    "border-2 border-purple-400/50",
                                    "bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-black/30",
                                    "shadow-2xl shadow-purple-500/30",
                                    "transition-all hover:border-purple-400/70 hover:shadow-purple-500/40",
                                )}
                            >
                                <Image
                                    src="/mdc-images/hands-comparison/perfect-hands.webp"
                                    alt="Ryla.ai perfectly generated hands showing natural proportions and realistic anatomy"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 200px"
                                    loading="lazy"
                                    quality={85}
                                />
                                {/* Premium glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent pointer-events-none" />

                                {/* "Ryla.ai" Badge */}
                                <RylaBadge position="top-right" />
                            </div>
                            <div className="text-center">
                                <p className="text-white text-sm font-bold mb-1">
                                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                                        Perfect Hands
                                    </span>
                                </p>
                                <p className="text-white/60 text-xs font-medium">Ryla.ai Quality</p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison highlight */}
                    <div className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 mb-4">
                        <p className="text-white/90 text-xs text-center font-medium">
                            <span className="text-purple-400 font-semibold">Perfect anatomy</span>{" "}
                            in every generated image and video
                        </p>
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient relative overflow-hidden group">
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Activate Perfect Hands</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Perfect details in every generated image
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
