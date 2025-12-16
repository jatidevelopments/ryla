// Age ranges for AI Influencer - Option A: Balanced ranges
export interface AgeRange {
    id: number;
    image: {
        src: string;
        alt: string;
        name: string;
    };
    value: string; // Range like "18-25"
    min: number; // Minimum age in range
    max: number; // Maximum age in range
}

export const INFLUENCER_AGE_RANGES: AgeRange[] = [
    {
        id: 1,
        image: {
            src: "",
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
            src: "",
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
            src: "",
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
            src: "",
            alt: "Age 42-50",
            name: "42-50",
        },
        value: "42-50",
        min: 42,
        max: 50,
    },
];

// Legacy export for backwards compatibility
export const INFLUENCER_AGE = INFLUENCER_AGE_RANGES;
