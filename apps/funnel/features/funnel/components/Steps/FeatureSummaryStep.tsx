"use client";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const features = [
    {
        icon: "/icons/magic-wand-icon.svg",
        text: "Create hyperrealistic AI Creators",
        gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
        icon: "/icons/security-check-icon.svg",
        text: "100% Character Consistency on every Image / Video",
        gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
    },
    {
        icon: "/icons/exchange-icon.svg",
        text: "Change Outfits / Styles with just Clicks",
        gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
        icon: "/icons/fire-icon.svg",
        text: "Create Viral Ready videos without complicated Prompting",
        gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
        icon: "/icons/microphone-icon.svg",
        text: "The best Lypsync videos on the market",
        gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
        icon: "/icons/sale-icon.svg",
        text: "Spicy Images and Videos to sell on Fanvue, Onlyfans, Tiktok...",
        gradient: "bg-gradient-to-br from-yellow-500 to-orange-500",
    },
];

export function FeatureSummaryStep() {
    const { nextStep } = useStepperContext();

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-3 md:mb-8">
                        <Stepper.Progress />
                    </div>

                    <div className="text-center mb-3 px-4">
                        <h2 className="text-white text-xl sm:text-2xl font-bold mb-3">
                            With Ryla.ai you will be able to
                        </h2>
                    </div>

                    <div className="w-full flex flex-col gap-2 mb-4 px-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-white/8 via-white/5 to-white/3 border border-white/10 hover:border-white/20 transition-all duration-200"
                            >
                                <div
                                    className={`w-9 h-9 rounded-lg ${feature.gradient} flex items-center justify-center shrink-0 shadow-md`}
                                >
                                    <Image
                                        src={feature.icon}
                                        alt=""
                                        width={18}
                                        height={18}
                                        className="w-[18px] h-[18px] invert brightness-0 opacity-90"
                                    />
                                </div>
                                <p className="text-white text-sm sm:text-base font-semibold leading-tight flex-1">
                                    {feature.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            className="w-full h-[45px] bg-primary-gradient hover:opacity-90 transition-opacity shadow-lg relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Launch my AI Influencer Today</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Everything you need to create, monetize, and grow
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
