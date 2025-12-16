"use client";

import { useState, useRef } from "react";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import { Video } from "@/components/ui/video";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

export function LipsyncFeatureStep() {
    const { nextStep } = useStepperContext();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const restartVideo = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    };

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center relative">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-gradient/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-40 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
                </div>

                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[120px] sm:mb-[70px] relative z-10 pb-4">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>

                    {/* Main heading with gradient text */}
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-2xl sm:text-3xl font-extrabold mb-4 capitalize text-center leading-tight">
                        LIPSYNC Videos Enabled
                    </h2>

                    {/* Sub-text */}
                    <p className="text-white/70 text-base sm:text-lg font-medium mb-8 text-center">
                        Also for dirty talk...
                    </p>

                    {/* Video Card */}
                    <div className="w-full mb-2 relative">
                        <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10 overflow-hidden group cursor-pointer">
                            {/* Video container - 4:5 aspect ratio */}
                            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden">
                                <Video
                                    ref={videoRef}
                                    src="/video/lipsync_1.mp4"
                                    className="absolute inset-0 w-full h-full scale-[1.15]"
                                    objectFit="cover"
                                    autoPlay
                                    muted={isMuted}
                                    playsInline
                                    controls={false}
                                    loading="lazy"
                                    quality="high"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-gradient/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                {/* Dark overlay */}
                                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                                {/* Border */}
                                <div className="absolute inset-0 border border-white/10 rounded-lg group-hover:border-white/30 transition-colors" />
                                
                                {/* Control Buttons - Bottom Right */}
                                <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
                                    {/* Redo/Restart Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            restartVideo();
                                        }}
                                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center group"
                                        aria-label="Restart video"
                                    >
                                        <RotateCcw className="w-5 h-5 text-white group-hover:text-primary-gradient transition-colors" />
                                    </button>
                                    
                                    {/* Mute/Unmute Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMute();
                                        }}
                                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center group"
                                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5 text-white group-hover:text-primary-gradient transition-colors" />
                                        ) : (
                                            <Volume2 className="w-5 h-5 text-white group-hover:text-primary-gradient transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-primary-gradient/20 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300 -z-10" />
                        </div>
                    </div>
                </div>

                {/* Enhanced bottom section - Always visible at bottom */}
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 right-0 z-100 backdrop-blur-sm border-t border-white/5">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            className="w-full h-[50px] bg-primary-gradient hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 relative overflow-hidden group"
                        >
                            <span className="relative z-10 text-base font-bold">Activate Lipsync</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </Button>
                        <p className="text-white/60 text-xs font-medium text-center mt-4 flex items-center justify-center gap-2">
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                            Experience realistic lip sync videos
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}

export default LipsyncFeatureStep;

