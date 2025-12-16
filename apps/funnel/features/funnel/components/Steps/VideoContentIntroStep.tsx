"use client";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const features = [
    {
        icon: "/icons/recording-icon.svg",
        title: "Create Hyper realistic Selfies and Videos",
        description: "Generate stunning selfies and videos with one click",
        gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
        icon: "/icons/fire-icon.svg",
        title: "Create Viral Social Videos",
        description: "Generate viral-ready content with your AI Model in 1 click",
        gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
        icon: "/icons/microphone-icon.svg",
        title: "Lipsync Videos",
        description: "Perfect lipsync for any audio, including dirty talk",
        gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
        icon: "/icons/exchange-icon.svg",
        title: "Faceswap Your Character",
        description: "Perfect character consistency across all videos",
        gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
    },
];

export function VideoContentIntroStep() {
    const { nextStep } = useStepperContext();

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>

                    <div className="text-center mb-6 px-4">
                        <h2 className="text-white/70 text-sm font-medium mb-2">Video Content</h2>
                        <p className="text-white text-2xl font-bold">
                            Unlock Dynamic Video Content
                        </p>
                    </div>

                    <div className="w-full flex flex-col gap-4 mb-8 px-4">
                        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0">
                                    <Image
                                        src="/icons/recording-icon.svg"
                                        alt="Video"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5 invert brightness-0"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-white text-lg font-bold">
                                        Video Content Options
                                    </h3>
                                    <p className="text-white/60 text-xs mt-0.5">
                                        Choose from perfectly optimized prompts
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-6">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200 border border-transparent hover:border-white/10"
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-lg ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}
                                        >
                                            <Image
                                                src={feature.icon}
                                                alt={feature.title}
                                                width={20}
                                                height={20}
                                                className="w-5 h-5 invert brightness-0 opacity-90"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white/90 text-sm font-medium leading-relaxed">
                                                {feature.title}
                                            </p>
                                            <p className="text-white/60 text-xs mt-1">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            className="w-full h-[45px] bg-primary-gradient hover:opacity-90 transition-opacity shadow-lg relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Unlock Video Content</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Unlock unlimited video content creation
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
