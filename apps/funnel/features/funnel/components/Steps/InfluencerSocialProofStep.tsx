"use client";
import { clsx } from "clsx";

import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";

import SpriteIcon from "@/components/SpriteIcon/SpriteIcon";
import Image from "next/image";

const INFLUENCER_SOCIAL_PROOF = {
    id: 1,
    description:
        "Create hyper-realistic AI influencers with perfect consistency—all in one platform. Face consistency, perfect hands, persistent memory. Fast generation, simple pricing.",
    avatar: "/images/avatars/avatar_3.webp",
    alt: "Alex P. Review Message",
    name: "Alex P.",
    rating: 5,
    message:
        "Finally, an AI influencer that looks REAL and stays consistent! One platform for everything—no more switching apps. Fast, simple pricing, perfect quality. Game changer! 🔥✨",
};

export function InfluencerSocialProofStep() {
    const { nextStep } = useStepperContext();

    const review = INFLUENCER_SOCIAL_PROOF;

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className={"w-full mb-20 md:mb-[92px]"}>
                        <Stepper.Progress />
                    </div>

                    <h2 className="text-white text-xl md:text-2xl font-bold mb-6 capitalize text-center">
                        What Our Users{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                            Say
                        </span>
                    </h2>

                    <div className={"relative w-full rounded-[10px] overflow-hidden"}>
                        <div
                            className={
                                "w-full h-full px-[20px] py-[25px] flex flex-col items-center justify-center relative z-3"
                            }
                        >
                            <p
                                className={
                                    "w-9/10 text-white text-base font-medium text-center mb-[35px]"
                                }
                            >
                                {review.description}
                            </p>

                            <div
                                className={clsx(
                                    "w-full rounded-[10px] pt-[14px] px-[14px] pb-[20px]",
                                    "bg-linear-to-b from-white to-[#ffe3ec]/70",
                                )}
                            >
                                <div className={"flex flex-col gap-[16px]"}>
                                    <div className={"w-full flex items-center gap-[14px]"}>
                                        <div className="p-[1px] rounded-full bg-white-gradient ">
                                            <SpriteIcon
                                                src={review.avatar}
                                                targetW={50}
                                                targetH={50}
                                                fit="cover"
                                                frame
                                                imageClassName="rounded-full"
                                            />
                                        </div>

                                        <div>
                                            <div className={"text-[17px] font-medium"}>
                                                {review.name}
                                            </div>
                                            <div className={"flex"}>
                                                {Array.from({
                                                    length: review.rating,
                                                }).map((_, i) => (
                                                    <Image
                                                        key={i}
                                                        src="/icons/rating-star.svg"
                                                        alt="ratingStar"
                                                        width={16}
                                                        height={16}
                                                        className="inline-block"
                                                        style={{
                                                            filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(258deg) brightness(104%) contrast(97%)",
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={"w-full text-sm text-black-2 font-medium"}>
                                        {review.message}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={"absolute inset-0 z-2 blur-[87px] bg-blue-500/10"} />
                        <div
                            className={clsx(
                                "absolute z-1 top-[50%] left-[50%] -translate-[50%]",
                                "w-4/10 h-4/10 blur-[87px] rounded-full",
                                "bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-blue-600/30",
                            )}
                        />
                    </div>
                </div>

                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient relative overflow-hidden group">
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Continue</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Join thousands building their AI influencer empire
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

export default InfluencerSocialProofStep;
