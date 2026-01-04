// Age ranges for AI Influencer
export interface AgeRangeOption {
  id: number;
  image: {
    src: string;
    alt: string;
    name: string;
  };
  value: string;
  min: number;
  max: number;
}

export const INFLUENCER_AGE_RANGES: AgeRangeOption[] = [
  {
    id: 1,
    image: {
      src: "/images/age-ranges/18-25.webp",
      alt: "Age 18-25",
      name: "18-25",
    },
    value: "18-25",
    min: 18,
    max: 25,
  },
  {
    id: 2,
    image: {
      src: "/images/age-ranges/26-33.webp",
      alt: "Age 26-33",
      name: "26-33",
    },
    value: "26-33",
    min: 26,
    max: 33,
  },
  {
    id: 3,
    image: {
      src: "/images/age-ranges/34-41.webp",
      alt: "Age 34-41",
      name: "34-41",
    },
    value: "34-41",
    min: 34,
    max: 41,
  },
  {
    id: 4,
    image: {
      src: "/images/age-ranges/42-50.webp",
      alt: "Age 42-50",
      name: "42-50",
    },
    value: "42-50",
    min: 42,
    max: 50,
  },
];

