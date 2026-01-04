// Skin features for AI Influencer
export interface SkinFeatureOption {
  id: number;
  image: {
    src: string;
    alt: string;
    name: string;
  };
  value: string;
}

export const INFLUENCER_SKIN_FEATURES = {
  freckles: [
    {
      id: 1,
      image: {
        src: "/images/skin-features/freckles/none.webp",
        alt: "No Freckles",
        name: "None",
      },
      value: "none",
    },
    {
      id: 2,
      image: {
        src: "/images/skin-features/freckles/light.webp",
        alt: "Light Freckles",
        name: "Light",
      },
      value: "light",
    },
    {
      id: 3,
      image: {
        src: "/images/skin-features/freckles/medium.webp",
        alt: "Medium Freckles",
        name: "Medium",
      },
      value: "medium",
    },
    {
      id: 4,
      image: {
        src: "/images/skin-features/freckles/heavy.webp",
        alt: "Heavy Freckles",
        name: "Heavy",
      },
      value: "heavy",
    },
  ] as SkinFeatureOption[],
  scars: [
    {
      id: 1,
      image: {
        src: "/images/skin-features/scars/none.webp",
        alt: "No Scars",
        name: "None",
      },
      value: "none",
    },
    {
      id: 2,
      image: {
        src: "/images/skin-features/scars/small.webp",
        alt: "Small Scars",
        name: "Small",
      },
      value: "small",
    },
    {
      id: 3,
      image: {
        src: "/images/skin-features/scars/medium.webp",
        alt: "Medium Scars",
        name: "Medium",
      },
      value: "medium",
    },
    {
      id: 4,
      image: {
        src: "/images/skin-features/scars/large.webp",
        alt: "Large Scars",
        name: "Large",
      },
      value: "large",
    },
  ] as SkinFeatureOption[],
  beautyMarks: [
    {
      id: 1,
      image: {
        src: "/images/skin-features/beauty-marks/none.webp",
        alt: "No Beauty Marks",
        name: "None",
      },
      value: "none",
    },
    {
      id: 2,
      image: {
        src: "/images/skin-features/beauty-marks/single.webp",
        alt: "Single Beauty Mark",
        name: "Single",
      },
      value: "single",
    },
    {
      id: 3,
      image: {
        src: "/images/skin-features/beauty-marks/multiple.webp",
        alt: "Multiple Beauty Marks",
        name: "Multiple",
      },
      value: "multiple",
    },
  ] as SkinFeatureOption[],
};

