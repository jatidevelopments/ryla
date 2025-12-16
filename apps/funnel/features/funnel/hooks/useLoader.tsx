import { useEffect, useRef, useState } from "react";

export function useLoader(initialCountdown: number, maxCountdown: number, speed: number) {
    const [progress, setProgress] = useState(initialCountdown);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const resolveRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [speed]);

    useEffect(() => {
        if (progress >= maxCountdown) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            resolveRef.current?.();
            resolveRef.current = null;
        }
    }, [progress, maxCountdown]);

    const start = () => {
        return new Promise<void>((resolve) => {
            if (initialCountdown >= maxCountdown) {
                setProgress(initialCountdown);
                resolve();
                return;
            }

            resolveRef.current = resolve;
            setProgress(initialCountdown);

            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev < maxCountdown) {
                        return prev + 1;
                    } else {
                        return prev;
                    }
                });
            }, speed);
        });
    };

    return { progress, start };
}
