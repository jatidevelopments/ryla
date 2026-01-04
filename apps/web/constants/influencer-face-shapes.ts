// Face shapes for AI Influencer
export interface FaceShapeOption {
  id: number;
  image: {
    src: string;
    alt: string;
    name: string;
  };
  value: string;
}

export const INFLUENCER_FACE_SHAPES: FaceShapeOption[] = [
  {
    id: 1,
    image: {
      src: "/images/face-shapes/oval.webp",
      alt: "Oval Face Shape",
      name: "Oval",
    },
    value: "oval",
  },
  {
    id: 2,
    image: {
      src: "/images/face-shapes/round.webp",
      alt: "Round Face Shape",
      name: "Round",
    },
    value: "round",
  },
  {
    id: 3,
    image: {
      src: "/images/face-shapes/square.webp",
      alt: "Square Face Shape",
      name: "Square",
    },
    value: "square",
  },
  {
    id: 4,
    image: {
      src: "/images/face-shapes/heart.webp",
      alt: "Heart Face Shape",
      name: "Heart",
    },
    value: "heart",
  },
  {
    id: 5,
    image: {
      src: "/images/face-shapes/diamond.webp",
      alt: "Diamond Face Shape",
      name: "Diamond",
    },
    value: "diamond",
  },
];

