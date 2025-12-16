"use client";

import StepWrapper from "@/components/layouts/StepWrapper";
import { Button } from "@/components/ui/button";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import Stepper from "@/components/stepper";
import SpriteIcon from "@/components/SpriteIcon/SpriteIcon";

const BRAND_IDS: string[] = [
    "brands-top-ai-tools-logo",
    "brands-aixploria-logo",
    "brands-zerohedge-logo",
    "brands-taaft-logo",
    "brands-the-ai-journal",
    "brands-nsfwaii-logo",
    "brands-toolify-ai-logo",
    "brands-entrepreneur-logo",
    "brands-citypaper-logo",
];

export function PartnershipProofStep() {
    const { nextStep } = useStepperContext();

    const FRAME_W = 126;
    const FRAME_H = 34;

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
                    <div className="w-full mb-5 md:mb-11">
                        <Stepper.Progress />
                    </div>

                    <h1 className="text-transparent bg-clip-text bg-primary-gradient text-[28px] font-extrabold uppercase mb-6 text-center">
                        Powered by Industry-Leading Technology
                    </h1>

                    <div className="w-full bg-gradient-to-br from-white/10 via-white/8 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6 mx-4 shadow-lg">
                        <p className="text-white text-base font-medium text-center leading-relaxed mb-5">
                            Ryla.ai partners with DreamCompanion to deliver the most realistic
                            AI-generated images and videos in the market.
                        </p>

                        <div className="flex flex-col items-center gap-2 pt-5 border-t border-white/20">
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-transparent bg-clip-text bg-primary-gradient text-xl font-extrabold">
                                    3+ million
                                </span>
                                <span className="text-white/90 text-sm font-semibold">people</span>
                            </div>
                            <span className="text-white/70 text-xs font-medium">trust our technology</span>
                        </div>
                    </div>

                    <div className="relative text-white bg-gradient-to-br from-purple-600/40 via-purple-500/30 to-pink-500/40 px-[28px] py-[20px] rounded-[10px] flex flex-col items-center justify-center mb-[30px] border border-purple-400/30 overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-transparent via-white/30 via-transparent to-transparent" />
                        
                        <div className="relative z-10 text-[45px] font-extrabold text-center leading-[30px]">
                            "
                        </div>
                        <div className="relative z-10 text-base font-semibold text-center capitalize mb-[25px]">
                            &quot;When you need an AI influencer that performs, Ryla.ai consistently
                            leads every shortlist in 2025.&quot;
                        </div>

                        <div className="relative z-10">
                            <SpriteIcon
                                src="/images/brands/entrepreneur-logo.png"
                                targetW={116}
                                targetH={28}
                            />
                        </div>
                    </div>

                    <div className="w-full flex flex-col items-center justify-center">
                        <div className="text-white/70 text-xs font-semibold text-center uppercase mb-[22px]">
                            Mentioned in:
                        </div>

                        <ul className="grid grid-cols-3 gap-4 items-center justify-center mb-[30px] sm:mb-[70px]">
                            {BRAND_IDS.map((id) => (
                                <li key={id} className="flex items-center justify-center">
                                    <SpriteIcon
                                        id={id}
                                        src={`/images/${id.replace(/^brands-/, "brands/")}.png`}
                                        targetW={FRAME_W}
                                        targetH={FRAME_H}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div
                    className="
                w-full
                flex items-center justify-center
                px-[15px] sm:px-10
                p-5
                bg-black-2
                sm:static fixed bottom-0 left-0
            "
                >
                    <div className="max-w-[450px] w-full">
                        <Button onClick={nextStep} className="w-full h-[45px] bg-primary-gradient relative overflow-hidden group">
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <span className="text-base font-bold relative z-10">Amazing, Let's Begin</span>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3">
                            Join millions creating with the best AI technology
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

export default PartnershipProofStep;
