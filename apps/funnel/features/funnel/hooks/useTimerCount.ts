import { useEffect, useState } from "react";

export const useTimer = (initialTime: number, isActive: boolean = false) => {
    const [countdown, setCountdown] = useState(initialTime);
    const [isTimerActive, setIsTimerActive] = useState(false);

    const startTimer = () => {
        setCountdown(initialTime);
        setIsTimerActive(true);
    };

    const stopTimer = () => {
        setIsTimerActive(false);
    };

    const resetTimer = () => {
        setCountdown(initialTime);
        setIsTimerActive(false);
    };

    useEffect(() => {
        if (isActive) {
            startTimer();
        } else {
            stopTimer();
        }
    }, [isActive, initialTime]);

    useEffect(() => {
        if (!isTimerActive) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsTimerActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTimerActive]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = countdown === 0 ? 100 : ((initialTime - countdown) / initialTime) * 100;

    const formattedTime = formatTime(countdown);

    const shouldShowTimer = isTimerActive || countdown === 0;

    return {
        countdown,
        progress,
        formattedTime,
        isTimerActive,
        shouldShowTimer,
        startTimer,
        stopTimer,
        resetTimer,
    };
};
