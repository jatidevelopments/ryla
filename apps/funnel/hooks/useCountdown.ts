import { useState, useEffect, useCallback } from "react";

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownOptions {
    onComplete?: () => void;
    onTick?: (time: TimeLeft) => void;
    autoStart?: boolean;
    interval?: number;
}

export interface CountdownReturn {
    timeLeft: TimeLeft;
    formattedTime: string;
    totalSeconds: number;
    isRunning: boolean;
    isCompleted: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
    stop: () => void;
    formatTime: (time: number) => string;
}

export const useCountdown = (
    initialTime: TimeLeft,
    options: CountdownOptions = {},
): CountdownReturn => {
    const { onComplete = () => {}, onTick = () => {}, autoStart = true, interval = 1000 } = options;

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(initialTime);
    const [isRunning, setIsRunning] = useState<boolean>(autoStart);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    const validateTime = useCallback((time: TimeLeft): boolean => {
        return time.hours >= 0 && time.minutes >= 0 && time.seconds >= 0;
    }, []);

    const start = useCallback((): void => {
        if (!isCompleted && validateTime(timeLeft)) {
            setIsRunning(true);
        }
    }, [isCompleted, timeLeft, validateTime]);

    const pause = useCallback((): void => {
        setIsRunning(false);
    }, []);

    const reset = useCallback((): void => {
        setTimeLeft(initialTime);
        setIsRunning(autoStart);
        setIsCompleted(false);
    }, [initialTime, autoStart]);

    const stop = useCallback((): void => {
        setIsRunning(false);
        setTimeLeft(initialTime);
        setIsCompleted(false);
    }, [initialTime]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (isRunning && !isCompleted) {
            intervalId = setInterval(() => {
                setTimeLeft((prev: TimeLeft) => {
                    let { hours, minutes, seconds } = prev;

                    // Calculate new time
                    if (seconds > 0) {
                        seconds--;
                    } else if (minutes > 0) {
                        minutes--;
                        seconds = 59;
                    } else if (hours > 0) {
                        hours--;
                        minutes = 59;
                        seconds = 59;
                    } else {
                        // Timer completed
                        setIsRunning(false);
                        setIsCompleted(true);
                        onComplete();
                        return { hours: 0, minutes: 0, seconds: 0 };
                    }

                    const newTime: TimeLeft = { hours, minutes, seconds };
                    onTick(newTime);
                    return newTime;
                });
            }, interval);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isRunning, isCompleted, interval]);

    const formatTime = useCallback((time: number): string => {
        return time.toString().padStart(2, "0");
    }, []);

    const getFormattedTime = useCallback((): string => {
        return `${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`;
    }, [timeLeft, formatTime]);

    const getTotalSeconds = useCallback((): number => {
        return timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
    }, [timeLeft]);

    return {
        timeLeft,
        formattedTime: getFormattedTime(),
        totalSeconds: getTotalSeconds(),
        isRunning,
        isCompleted,
        start,
        pause,
        reset,
        stop,
        formatTime,
    };
};
