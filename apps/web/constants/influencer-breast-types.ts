// Breast types for AI Influencer
export interface BreastTypeOption {
  id: number;
  image: {
    src: string;
    alt: string;
    name: string;
  };
  value: string;
}

export const INFLUENCER_BREAST_TYPES: BreastTypeOption[] = [
  {
    id: 1,
    image: {
      src: "/images/breast-types/regular.webp",
      alt: "Regular Breast Type",
      name: "Regular",
    },
    value: "regular",
  },
  {
    id: 2,
    image: {
      src: "/images/breast-types/perky.webp",
      alt: "Perky Breast Type",
      name: "Perky",
    },
    value: "perky",
  },
  {
    id: 3,
    image: {
      src: "/images/breast-types/saggy.webp",
      alt: "Saggy Breast Type",
      name: "Saggy",
    },
    value: "saggy",
  },
  {
    id: 4,
    image: {
      src: "/images/breast-types/torpedo.webp",
      alt: "Torpedo Breast Type",
      name: "Torpedo",
    },
    value: "torpedo",
  },
];

