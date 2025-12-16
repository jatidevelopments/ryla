"use client";
import { useState, useMemo } from "react";

import { useCountdown } from "@/hooks/useCountdown";
import Image from "next/image";

export function SaleBanner() {
    const [restartKey, setRestartKey] = useState(0);

    const initialTime = useMemo(() => {
        if (typeof window === "undefined") return { hours: 0, minutes: 10, seconds: 0 };

        const savedStart = sessionStorage.getItem("countdownStart");

        if (savedStart) {
            const elapsed = Math.floor((Date.now() - parseInt(savedStart)) / 1000);
            const remaining = Math.max(0, 600 - elapsed);

            return {
                hours: Math.floor(remaining / 3600),
                minutes: Math.floor((remaining % 3600) / 60),
                seconds: remaining % 60,
            };
        } else {
            sessionStorage.setItem("countdownStart", Date.now().toString());
            return { hours: 0, minutes: 10, seconds: 0 };
        }
    }, [restartKey]);

    const restartTimer = () => {
        sessionStorage.setItem("countdownStart", Date.now().toString());
        setRestartKey((prev) => prev + 1);
    };

    const countdown = useCountdown(initialTime, {
        onComplete: () => {
            setTimeout(() => {
                restartTimer();
            }, 1000);
        },
    });

    return (
        <div className="fixed z-10 top-0 left-0 w-full bg-[#000]/30 text-white backdrop-blur-[20px] py-2 px-4 mb-5 md:mb-8">
            <div className="flex items-center justify-center">
                <div className="flex items-center gap-x-2 md:gap-x-4 mr-2 md:mr-4">
                    <span className="text-5 md:text-[22px] font-bold text-light-purple">-70%</span>
                    <Image
                        src="/icons/sale-icon.svg"
                        alt="Sale Icon"
                        width={20}
                        height={20}
                        className="w-[20px] h-[19px] invert brightness-0 hidden lg:block"
                    />
                    <span className="hidden md:block -ml-1 text-sm font-medium uppercase bg-gradient-to-r from-medium-purple to-light-yellow bg-clip-text">
                        Premium for new users
                    </span>
                    <span className="block md:hidden ml-1 text-sm font-semibold uppercase text-medium-purple text-[8px]">
                        Premium for
                        <br />
                        new users
                    </span>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-0.5 text-lg font-mono">
                        <span className="bg-white/20 border-1 border-stone-500 px-1.5 py-1 md:px-2 md:py-1.5 rounded-md text-white font-bold text-center text-xs md:text-sm">
                            {countdown.formatTime(countdown.timeLeft.hours)}
                        </span>
                        <span className="text-white">:</span>
                        <span className="bg-white/20 border-1 border-stone-500 px-1.5 py-1 md:px-2 md:py-1.5 rounded-md text-white font-bold text-center text-xs md:text-sm">
                            {countdown.formatTime(countdown.timeLeft.minutes)}
                        </span>
                        <span className="text-white">:</span>
                        <span className="bg-white/20 border-1 border-stone-500 px-1.5 py-1 md:px-2 md:py-1.5 rounded-md text-white font-bold text-center text-xs md:text-sm">
                            {countdown.formatTime(countdown.timeLeft.seconds)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SaleBanner;
