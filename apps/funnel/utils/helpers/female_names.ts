import { FEMALE_NAMES } from "@/constants/female_names";

export const getRandomFemaleName = () => {
    const randomIndex = Math.floor(Math.random() * FEMALE_NAMES.length);
    return FEMALE_NAMES[randomIndex];
};
