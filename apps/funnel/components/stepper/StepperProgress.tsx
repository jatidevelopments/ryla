import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useStepperContext } from "@/components/stepper/Stepper.context";

export default function StepperProgress() {
    const { prevStep, value, max } = useStepperContext();

    const percentValue = (value * 100) / max;

    return (
        <div className={"w-full"}>
            <div className={"flex items-start gap-3"}>
                <Button
                    className={
                        "size-[38px] rounded-xl bg-[#3C3842] hover:bg-[#4A4550] border border-white/5 transition-all duration-200 hover:border-white/10 hover:scale-105 active:scale-95 shadow-sm"
                    }
                    onClick={prevStep}
                >
                    <ChevronLeft className={"size-5 text-white/90"} />
                </Button>
                <div className={"flex-1 flex flex-col gap-2.5"}>
                    <p className={"text-[#8E8A93] text-sm font-semibold leading-tight"}>
                        Create your AI influencer
                    </p>
                    <div className={"w-full relative"}>
                        <Progress
                            value={percentValue}
                            max={100}
                            className="h-1.5 bg-[#3C3842] rounded-full"
                            indicatorProps={{
                                className: "bg-gradient-to-r from-[#8A63F2] to-[#6A40E6] shadow-sm shadow-purple-500/30 rounded-full transition-all duration-300 ease-out",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
