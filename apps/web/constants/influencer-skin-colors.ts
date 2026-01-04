// Skin colors for AI Influencer
export interface SkinColorOption {
  id: number;
  image: {
    src: string;
    alt: string;
    name: string;
  };
  value: string;
}

export const INFLUENCER_SKIN_COLORS: SkinColorOption[] = [
  {
    id: 1,
    image: {
      src: "/images/skin-colors/light.webp",
      alt: "Light Skin Color",
      name: "Light",
    },
    value: "light",
  },
  {
    id: 2,
    image: {
      src: "/images/skin-colors/medium.webp",
      alt: "Medium Skin Color",
      name: "Medium",
    },
    value: "medium",
  },
  {
    id: 3,
    image: {
      src: "/images/skin-colors/tan.webp",
      alt: "Tan Skin Color",
      name: "Tan",
    },
    value: "tan",
  },
  {
    id: 4,
    image: {
      src: "/images/skin-colors/dark.webp",
      alt: "Dark Skin Color",
      name: "Dark",
    },
    value: "dark",
  },
];

