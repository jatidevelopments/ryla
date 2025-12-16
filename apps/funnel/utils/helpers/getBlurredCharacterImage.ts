const ethnicityMap: Record<string, string> = {
    black: "black",
    latina: "black",
    caucasian: "white",
    arab: "white",
    asian: "white",
};

const hairColorMap: Record<string, string> = {
    black: "black",
    blonde: "blonde",
    brunette: "brunette",
    ginger: "ginger",
};

/**
 * Returns the blurred character image path based on ethnicity and hair color.
 * @param ethnicity - The ethnicity value (e.g., 'black', 'caucasian')
 * @param hairColor - The hair color value (e.g., 'blonde', 'black', 'brunette', 'ginger')
 * @returns The image path string or null if not found
 */
export function getBlurredCharacterImage(ethnicity: string, hairColor: string): string | null {
    const eth = ethnicityMap[ethnicity];
    const hair = hairColorMap[hairColor];
    if (!eth || !hair) return null;
    return `/images/blurred-characters/${eth}-${hair}.webp`;
}
