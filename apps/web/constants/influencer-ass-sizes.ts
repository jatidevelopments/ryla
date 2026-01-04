// Ass sizes for AI Influencer
export interface AssSizeOption {
  id: number;
  image: {
    src: string;
    alt: string;
    name: string;
  };
  value: string;
}

export const INFLUENCER_ASS_SIZES: AssSizeOption[] = [
  {
    id: 1,
    image: {
      src: "/images/ass-sizes/small.webp",
      alt: "Small Ass Size",
      name: "Small",
    },
    value: "small",
  },
  {
    id: 2,
    image: {
      src: "/images/ass-sizes/medium.webp",
      alt: "Medium Ass Size",
      name: "Medium",
    },
    value: "medium",
  },
  {
    id: 3,
    image: {
      src: "/images/ass-sizes/large.webp",
      alt: "Large Ass Size",
      name: "Large",
    },
    value: "large",
  },
  {
    id: 4,
    image: {
      src: "/images/ass-sizes/huge.webp",
      alt: "Huge Ass Size",
      name: "Huge",
    },
    value: "huge",
  },
];

