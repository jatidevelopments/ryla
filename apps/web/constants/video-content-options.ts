// Video content options for AI Influencer
export interface VideoContentOption {
  id: number;
  label: string;
  value: string;
  image: {
    src: string;
    alt: string;
  };
}

export const VIDEO_CONTENT_OPTIONS: VideoContentOption[] = [
  {
    id: 1,
    label: "Selfie Posing",
    value: "selfie-posing",
    image: {
      src: "/images/video-content/selfie-posing.webp",
      alt: "Selfie Posing",
    },
  },
  {
    id: 2,
    label: "Dance Video",
    value: "dance-video",
    image: {
      src: "/images/video-content/dance-video.webp",
      alt: "Dance Video",
    },
  },
  {
    id: 3,
    label: "Driving Car",
    value: "driving-car",
    image: {
      src: "/images/video-content/driving-car.webp",
      alt: "Driving Car",
    },
  },
  {
    id: 4,
    label: "Custom",
    value: "custom",
    image: {
      src: "/images/video-content/custom.webp",
      alt: "Custom",
    },
  },
];

