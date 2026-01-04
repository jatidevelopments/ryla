// Piercing options for AI Influencer
export interface PiercingOption {
  id: number;
  image: {
    src: string;
    alt: string;
    name: string;
  };
  value: string;
}

export const INFLUENCER_PIERCINGS: PiercingOption[] = [
  {
    id: 1,
    image: {
      src: "/images/piercings/none.webp",
      alt: "No Piercings",
      name: "None",
    },
    value: "none",
  },
  {
    id: 2,
    image: {
      src: "/images/piercings/ear.webp",
      alt: "Ear Piercings",
      name: "Ear",
    },
    value: "ear",
  },
  {
    id: 3,
    image: {
      src: "/images/piercings/nose.webp",
      alt: "Nose Piercing",
      name: "Nose",
    },
    value: "nose",
  },
  {
    id: 4,
    image: {
      src: "/images/piercings/lip.webp",
      alt: "Lip Piercing",
      name: "Lip",
    },
    value: "lip",
  },
  {
    id: 5,
    image: {
      src: "/images/piercings/eyebrow.webp",
      alt: "Eyebrow Piercing",
      name: "Eyebrow",
    },
    value: "eyebrow",
  },
  {
    id: 6,
    image: {
      src: "/images/piercings/multiple.webp",
      alt: "Multiple Piercings",
      name: "Multiple",
    },
    value: "multiple",
  },
];

