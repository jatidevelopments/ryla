'use client';

import { useFormContext } from 'react-hook-form';
import Stepper from '@/components/stepper';
import StepWrapper from '@/components/layouts/StepWrapper';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { Button } from '@/components/ui/button';
import { Video } from '@/components/ui/video';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';
import { VIDEO_CONTENT_OPTIONS } from '@/constants/video-content-options';
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';

const videoContentOptions = [
  {
    value: 'selfie-posing',
    label: 'Selfie Posing',
    video: '/video/selfie_1.mp4',
    icon: '/icons/recording-icon.svg',
    gradient: 'bg-gradient-to-br from-pink-500 to-rose-500',
  },
  {
    value: 'dance-video',
    label: 'Dance Video',
    video: '/video/dancing_1.mp4',
    icon: '/icons/fire-icon.svg',
    gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
  },
  {
    value: 'driving-car',
    label: 'Driving Car',
    video: '/video/car_1.mp4',
    icon: '/icons/exchange-icon.svg',
    gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
  {
    value: 'custom',
    label: 'Custom',
    video: '/video/custom_1.mp4',
    icon: '/icons/magic-wand-icon.svg',
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
];

export function VideoContentOptionsStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();

  const video_options = form.watch('video_content_options') || [];
  const enable_viral_videos = form.watch('enable_viral_videos');

  const toggleVideoOption = (value: string) => {
    const current = video_options || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    form.setValue('video_content_options', updated, { shouldValidate: true });

    // PostHog tracking
    safePostHogCapture('funnel_option_selected', {
      step_name: 'Video Content Options',
      step_index: 26,
      option_type: 'video_content_option',
      option_value: value,
      is_selected: updated.includes(value),
      total_selected: updated.length,
    });
  };

  const toggleViralVideos = () => {
    const newValue = !enable_viral_videos;
    form.setValue('enable_viral_videos', newValue, { shouldValidate: true });

    // PostHog tracking
    safePostHogCapture('funnel_option_selected', {
      step_name: 'Video Content Options',
      step_index: 26,
      option_type: 'enable_viral_videos',
      option_value: String(newValue),
    });
  };

  return (
    <StepWrapper>
      <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
        <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]">
          <div className="w-full mb-5 md:mb-11">
            <Stepper.Progress />
          </div>

          <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
            Create Viral Social Videos
          </h2>
          <p className="text-white/90 text-base font-medium text-center mb-8 px-4">
            Just choose from perfectly optimized prompts
          </p>

          <div className="w-full flex flex-col gap-4 mb-6 px-4">
            {/* Video Content Selection */}
            <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-3">
                {videoContentOptions.map((option) => {
                  const _optionData = VIDEO_CONTENT_OPTIONS.find(
                    (o) => o.value === option.value
                  );
                  const isSelected = video_options.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleVideoOption(option.value)}
                      className={`relative aspect-square rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-black/30 shadow-2xl shadow-purple-500/30 hover:border-purple-400/70 hover:shadow-purple-500/40'
                          : 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-black/30 shadow-2xl shadow-purple-500/30 hover:border-purple-400/70 hover:shadow-purple-500/40'
                      }`}
                    >
                      {/* Shimmer effect when selected */}
                      {isSelected && (
                        <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-transparent via-white/30 via-transparent to-transparent pointer-events-none z-20" />
                      )}
                      {/* Video Background */}
                      <div className="absolute inset-0">
                        <Video
                          src={option.video}
                          autoPlay
                          loop
                          muted
                          playsInline
                          loading="lazy"
                          quality="medium"
                          objectFit="cover"
                          className="w-full h-full"
                        />
                        {/* Dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-black/30" />
                      </div>

                      {/* Content Overlay - Icon and Text at bottom left */}
                      <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                        {/* Icon and Text side by side */}
                        <div className="flex items-center gap-2.5">
                          {/* Icon */}
                          <div
                            className={`w-9 h-9 rounded-lg ${
                              option.gradient
                            } flex items-center justify-center shadow-lg transition-all duration-200 flex-shrink-0 backdrop-blur-sm border border-white/20 ${
                              isSelected ? 'scale-110 ring-2 ring-white/30' : ''
                            }`}
                          >
                            <Image
                              src={option.icon}
                              alt={option.label}
                              width={18}
                              height={18}
                              className="w-[18px] h-[18px] invert brightness-0 opacity-95"
                              sizes="18px"
                              loading="lazy"
                              quality={85}
                            />
                          </div>
                          {/* Text */}
                          <p
                            className={`text-sm font-bold text-left leading-tight ${
                              isSelected
                                ? 'text-white drop-shadow-lg'
                                : 'text-white/95 drop-shadow-md'
                            }`}
                          >
                            {option.label}
                          </p>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-20 shadow-md">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Viral Ready Videos Toggle */}
            <button
              onClick={toggleViralVideos}
              className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 ${
                enable_viral_videos
                  ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 ${
                    enable_viral_videos ? 'scale-110' : ''
                  }`}
                >
                  <TrendingUp
                    className="w-7 h-7 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1 text-left">
                  <h3
                    className={`text-lg font-bold mb-1 ${
                      enable_viral_videos ? 'text-white' : 'text-white/90'
                    }`}
                  >
                    Create Viral Ready videos
                  </h3>
                  <p
                    className={`text-sm ${
                      enable_viral_videos ? 'text-white/70' : 'text-white/60'
                    }`}
                  >
                    Without complicated prompting
                  </p>
                </div>
                {enable_viral_videos && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
        <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
          <div className="max-w-[450px] w-full">
            <Button
              onClick={nextStep}
              className="w-full h-[45px] bg-primary-gradient hover:opacity-90 transition-opacity shadow-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
              <span className="text-base font-bold relative z-10">
                Let's Create Viral Videos
              </span>
            </Button>
            <p className="text-white/50 text-xs font-medium text-center mt-3">
              Create viral-ready content with just one click
            </p>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
