// Tattoo options for AI Influencer
export interface TattooOption {
  id: number;
  image: {
    src: string;
    alt: string;
    name: string;
  };
  value: string;
}

export const INFLUENCER_TATTOOS: TattooOption[] = [
  {
    id: 1,
    image: {
      src: "/images/tattoos/none.webp",
      alt: "No Tattoos",
      name: "None",
    },
    value: "none",
  },
  {
    id: 2,
    image: {
      src: "/images/tattoos/small.webp",
      alt: "Small Tattoos",
      name: "Small",
    },
    value: "small",
  },
  {
    id: 3,
    image: {
      src: "/images/tattoos/medium.webp",
      alt: "Medium Tattoos",
      name: "Medium",
    },
    value: "medium",
  },
  {
    id: 4,
    image: {
      src: "/images/tattoos/large.webp",
      alt: "Large Tattoos",
      name: "Large",
    },
    value: "large",
  },
  {
    id: 5,
    image: {
      src: "/images/tattoos/full-body.webp",
      alt: "Full Body Tattoos",
      name: "Full Body",
    },
    value: "full-body",
  },
];

