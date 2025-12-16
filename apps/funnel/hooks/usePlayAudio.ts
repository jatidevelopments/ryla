"use client";
import { useRef, useEffect } from "react";

const activeAudios: Array<HTMLAudioElement> = [];

const usePlayAudio = (audioUrl: string) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && !audioRef.current) {
            audioRef.current = new Audio(audioUrl);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                const index = activeAudios.indexOf(audioRef.current);
                if (index > -1) {
                    activeAudios.splice(index, 1);
                }
            }
        };
    }, [audioUrl]);

    const play = () => {
        if (!audioRef.current) {
            return;
        }

        activeAudios.forEach((audio) => {
            if (audio !== audioRef.current) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        activeAudios.length = 0;
        activeAudios.push(audioRef.current);

        audioRef.current.play();
    };

    return play;
};

export default usePlayAudio;
