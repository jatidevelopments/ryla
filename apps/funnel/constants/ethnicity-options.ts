// Ethnicity-based option mappings
export type EthnicityValue = "arab" | "caucasian" | "black" | "latina" | "asian" | "mixed";

export interface EthnicityOptions {
    skinColors: string[]; // values from INFLUENCER_SKIN_COLORS
    eyeColors: string[]; // values from EYES_COLORS
    hairColors: string[]; // values from CHARACTER_HAIRCUT_COLOR
    hairStyles: string[]; // values from CHARACTER_HAIRCUT_STYLE
    faceShapes: string[]; // values from INFLUENCER_FACE_SHAPES
    frecklesCommon: boolean; // Whether freckles are common for this ethnicity
}

export const ETHNICITY_OPTIONS_MAP: Record<EthnicityValue, EthnicityOptions> = {
    arab: {
        skinColors: ["light", "medium", "tan"],
        eyeColors: ["brown", "green", "grey"],
        hairColors: ["black", "brunette"],
        hairStyles: ["bun", "long", "short", "curly-long", "hair-bow", "braids"],
        faceShapes: ["oval", "round", "square", "heart", "diamond"],
        frecklesCommon: false,
    },
    caucasian: {
        skinColors: ["light", "medium", "tan"],
        eyeColors: ["blue", "green", "grey", "brown"],
        hairColors: ["blonde", "ginger", "brunette", "black"],
        hairStyles: ["bun", "long", "short", "curly-long", "hair-bow"],
        faceShapes: ["oval", "round", "square", "heart", "diamond"],
        frecklesCommon: true,
    },
    black: {
        skinColors: ["medium", "tan", "dark"],
        eyeColors: ["brown", "green", "grey"],
        hairColors: ["black"],
        hairStyles: ["curly-long", "braids", "long", "short", "bun"],
        faceShapes: ["oval", "round", "square", "heart", "diamond"],
        frecklesCommon: false,
    },
    latina: {
        skinColors: ["light", "medium", "tan", "dark"],
        eyeColors: ["brown", "green", "grey", "blue"],
        hairColors: ["black", "brunette", "blonde"],
        hairStyles: ["long", "curly-long", "braids", "bun", "short", "hair-bow"],
        faceShapes: ["oval", "round", "square", "heart", "diamond"],
        frecklesCommon: false,
    },
    asian: {
        skinColors: ["light", "medium", "tan"],
        eyeColors: ["brown", "grey"],
        hairColors: ["black", "brunette"],
        hairStyles: ["long", "short", "bun", "hair-bow"],
        faceShapes: ["oval", "round", "square", "heart", "diamond"],
        frecklesCommon: false,
    },
    mixed: {
        skinColors: ["light", "medium", "tan", "dark"],
        eyeColors: ["brown", "blue", "green", "grey"],
        hairColors: ["black", "blonde", "ginger", "brunette"],
        hairStyles: ["bun", "long", "short", "curly-long", "hair-bow", "braids"],
        faceShapes: ["oval", "round", "square", "heart", "diamond"],
        frecklesCommon: true,
    },
};

