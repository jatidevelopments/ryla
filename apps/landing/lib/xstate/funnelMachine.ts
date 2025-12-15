import { createMachine, assign, MachineConfig } from "xstate";

// Simplified types for the funnel context
export interface FunnelContext {
    userData: Record<string, any>;
    characterData: Record<string, any>;
    nsfwPreferences: Record<string, any>;
    paymentData: Record<string, any>;
    currentStep: number;
    totalSteps: number;
    funnelType: "creator" | "fan" | "business" | "adult";
    sessionId: string;
    stepHistory: string[];
    validationErrors: Record<string, string>;
}

// Events that can be sent to the state machine
export type FunnelEvent =
    | { type: "NEXT" }
    | { type: "PREVIOUS" }
    | { type: "GO_TO_STEP"; step: number }
    | { type: "UPDATE_DATA"; data: Record<string, any> }
    | { type: "UPDATE_NSFW_PREFERENCES"; preferences: Record<string, any> }
    | { type: "UPDATE_CHARACTER_DATA"; data: Record<string, any> }
    | { type: "UPDATE_PAYMENT_DATA"; data: Record<string, any> }
    | { type: "VALIDATION_ERROR"; errors: Record<string, string> }
    | { type: "RESET_FUNNEL" }
    | { type: "COMPLETE_FUNNEL" };

// Adult Funnel Machine (simplified)
export const adultFunnelMachine = createMachine({
    id: "adultFunnel",
    initial: "startFunnel",
    context: {
        userData: {},
        characterData: {},
        nsfwPreferences: {},
        paymentData: {},
        currentStep: 1,
        totalSteps: 44,
        funnelType: "adult" as const,
        sessionId: "",
        stepHistory: [],
        validationErrors: {},
    },
    states: {
        startFunnel: {
            on: {
                NEXT: "socialProof",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        socialProof: {
            on: {
                NEXT: "connection",
                PREVIOUS: "startFunnel",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        connection: {
            on: {
                NEXT: "assistant",
                PREVIOUS: "socialProof",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        assistant: {
            on: {
                NEXT: "characterStyle",
                PREVIOUS: "connection",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        characterStyle: {
            on: {
                NEXT: "preferredAge",
                PREVIOUS: "assistant",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        preferredAge: {
            on: {
                NEXT: "userAge",
                PREVIOUS: "characterStyle",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        userAge: {
            on: {
                NEXT: "happyUsers",
                PREVIOUS: "preferredAge",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        happyUsers: {
            on: {
                NEXT: "characterAge",
                PREVIOUS: "userAge",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        characterAge: {
            on: {
                NEXT: "preferredRelationship",
                PREVIOUS: "happyUsers",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        preferredRelationship: {
            on: {
                NEXT: "uniqueCompanion",
                PREVIOUS: "characterAge",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        uniqueCompanion: {
            on: {
                NEXT: "personalityTraits",
                PREVIOUS: "preferredRelationship",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        personalityTraits: {
            on: {
                NEXT: "interests",
                PREVIOUS: "uniqueCompanion",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        interests: {
            on: {
                NEXT: "foreignLanguage",
                PREVIOUS: "personalityTraits",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        foreignLanguage: {
            on: {
                NEXT: "languageSupport",
                PREVIOUS: "interests",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        languageSupport: {
            on: {
                NEXT: "ethnicity",
                PREVIOUS: "foreignLanguage",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        ethnicity: {
            on: {
                NEXT: "yourType",
                PREVIOUS: "languageSupport",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        yourType: {
            on: {
                NEXT: "spicyCustomContent",
                PREVIOUS: "ethnicity",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        spicyCustomContent: {
            on: {
                NEXT: "companyContentComment",
                PREVIOUS: "yourType",
                UPDATE_NSFW_PREFERENCES: { actions: "updateNSFWPreferences" },
            },
        },
        companyContentComment: {
            on: {
                NEXT: "bodyType",
                PREVIOUS: "spicyCustomContent",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        bodyType: {
            on: {
                NEXT: "breastType",
                PREVIOUS: "companyContentComment",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        breastType: {
            on: {
                NEXT: "buttType",
                PREVIOUS: "bodyType",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        buttType: {
            on: {
                NEXT: "eyesColor",
                PREVIOUS: "breastType",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        eyesColor: {
            on: {
                NEXT: "haircutStyle",
                PREVIOUS: "buttType",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        haircutStyle: {
            on: {
                NEXT: "almostThere",
                PREVIOUS: "eyesColor",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        almostThere: {
            on: {
                NEXT: "relationship",
                PREVIOUS: "haircutStyle",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        relationship: {
            on: {
                NEXT: "turnsOfYou",
                PREVIOUS: "almostThere",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        turnsOfYou: {
            on: {
                NEXT: "wantToTry",
                PREVIOUS: "relationship",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        wantToTry: {
            on: {
                NEXT: "dirtyTalks",
                PREVIOUS: "turnsOfYou",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        dirtyTalks: {
            on: {
                NEXT: "selectVoice",
                PREVIOUS: "wantToTry",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        selectVoice: {
            on: {
                NEXT: "whatTurnsOffInDating",
                PREVIOUS: "dirtyTalks",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        whatTurnsOffInDating: {
            on: {
                NEXT: "loneliness",
                PREVIOUS: "selectVoice",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        loneliness: {
            on: {
                NEXT: "yourAiPartner",
                PREVIOUS: "whatTurnsOffInDating",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        yourAiPartner: {
            on: {
                NEXT: "loader1",
                PREVIOUS: "loneliness",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        loader1: {
            on: {
                NEXT: "receivePhotos",
                PREVIOUS: "yourAiPartner",
            },
        },
        receivePhotos: {
            on: {
                NEXT: "loader2",
                PREVIOUS: "loader1",
            },
        },
        loader2: {
            on: {
                NEXT: "receiveVoiceMessages",
                PREVIOUS: "receivePhotos",
            },
        },
        receiveVoiceMessages: {
            on: {
                NEXT: "loader3",
                PREVIOUS: "loader2",
            },
        },
        loader3: {
            on: {
                NEXT: "receiveVideo",
                PREVIOUS: "receiveVoiceMessages",
            },
        },
        receiveVideo: {
            on: {
                NEXT: "loader4",
                PREVIOUS: "loader3",
            },
        },
        loader4: {
            on: {
                NEXT: "receiveVideoCalls",
                PREVIOUS: "receiveVideo",
            },
        },
        receiveVideoCalls: {
            on: {
                NEXT: "dreamCompanion",
                PREVIOUS: "loader4",
            },
        },
        dreamCompanion: {
            on: {
                NEXT: "auth",
                PREVIOUS: "receiveVideoCalls",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        auth: {
            on: {
                NEXT: "subscription",
                PREVIOUS: "dreamCompanion",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        subscription: {
            on: {
                NEXT: "paymentForm",
                PREVIOUS: "auth",
                UPDATE_PAYMENT_DATA: { actions: "updatePaymentData" },
            },
        },
        paymentForm: {
            on: {
                NEXT: "completed",
                PREVIOUS: "subscription",
                UPDATE_PAYMENT_DATA: { actions: "updatePaymentData" },
            },
        },
        completed: {
            type: "final",
        },
    },
}, {
    actions: {
        updateData: assign({
            userData: (context, event) => {
                if (event && (event as any).type === "UPDATE_DATA") {
                    return { ...(context as any).userData, ...(event as any).data };
                }
                return (context as any).userData;
            },
        }),
        updateCharacterData: assign({
            characterData: (context, event) => {
                if (event && (event as any).type === "UPDATE_CHARACTER_DATA") {
                    return { ...(context as any).characterData, ...(event as any).data };
                }
                return (context as any).characterData;
            },
        }),
        updateNSFWPreferences: assign({
            nsfwPreferences: (context, event) => {
                if (event && (event as any).type === "UPDATE_NSFW_PREFERENCES") {
                    return { ...(context as any).nsfwPreferences, ...(event as any).preferences };
                }
                return (context as any).nsfwPreferences;
            },
        }),
        updatePaymentData: assign({
            paymentData: (context, event) => {
                if (event && (event as any).type === "UPDATE_PAYMENT_DATA") {
                    return { ...(context as any).paymentData, ...(event as any).data };
                }
                return (context as any).paymentData;
            },
        }),
    },
});

// Creator Funnel Machine (simplified)
export const creatorFunnelMachine = createMachine({
    id: "creatorFunnel",
    initial: "heroVideo",
    context: {
        userData: {},
        characterData: {},
        nsfwPreferences: {},
        paymentData: {},
        currentStep: 1,
        totalSteps: 20,
        funnelType: "creator" as const,
        sessionId: "",
        stepHistory: [],
        validationErrors: {},
    },
    states: {
        heroVideo: {
            on: {
                NEXT: "creatorBenefits",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        creatorBenefits: {
            on: {
                NEXT: "characterStyle",
                PREVIOUS: "heroVideo",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        characterStyle: {
            on: {
                NEXT: "nsfwContentPolicy",
                PREVIOUS: "creatorBenefits",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        nsfwContentPolicy: {
            on: {
                NEXT: "subscription",
                PREVIOUS: "characterStyle",
                UPDATE_NSFW_PREFERENCES: { actions: "updateNSFWPreferences" },
            },
        },
        subscription: {
            on: {
                NEXT: "completed",
                PREVIOUS: "nsfwContentPolicy",
                UPDATE_PAYMENT_DATA: { actions: "updatePaymentData" },
            },
        },
        completed: {
            type: "final",
        },
    },
}, {
    actions: {
        updateData: assign({
            userData: (context, event) => {
                if (event && (event as any).type === "UPDATE_DATA") {
                    return { ...(context as any).userData, ...(event as any).data };
                }
                return (context as any).userData;
            },
        }),
        updateCharacterData: assign({
            characterData: (context, event) => {
                if (event && (event as any).type === "UPDATE_CHARACTER_DATA") {
                    return { ...(context as any).characterData, ...(event as any).data };
                }
                return (context as any).characterData;
            },
        }),
        updateNSFWPreferences: assign({
            nsfwPreferences: (context, event) => {
                if (event && (event as any).type === "UPDATE_NSFW_PREFERENCES") {
                    return { ...(context as any).nsfwPreferences, ...(event as any).preferences };
                }
                return (context as any).nsfwPreferences;
            },
        }),
        updatePaymentData: assign({
            paymentData: (context, event) => {
                if (event && (event as any).type === "UPDATE_PAYMENT_DATA") {
                    return { ...(context as any).paymentData, ...(event as any).data };
                }
                return (context as any).paymentData;
            },
        }),
    },
});

// Fan Funnel Machine (simplified)
export const fanFunnelMachine = createMachine({
    id: "fanFunnel",
    initial: "immersiveVideo",
    context: {
        userData: {},
        characterData: {},
        nsfwPreferences: {},
        paymentData: {},
        currentStep: 1,
        totalSteps: 15,
        funnelType: "fan" as const,
        sessionId: "",
        stepHistory: [],
        validationErrors: {},
    },
    states: {
        immersiveVideo: {
            on: {
                NEXT: "personalityQuiz",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        personalityQuiz: {
            on: {
                NEXT: "characterStyle",
                PREVIOUS: "immersiveVideo",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        characterStyle: {
            on: {
                NEXT: "nsfwContentPolicy",
                PREVIOUS: "personalityQuiz",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        nsfwContentPolicy: {
            on: {
                NEXT: "subscription",
                PREVIOUS: "characterStyle",
                UPDATE_NSFW_PREFERENCES: { actions: "updateNSFWPreferences" },
            },
        },
        subscription: {
            on: {
                NEXT: "completed",
                PREVIOUS: "nsfwContentPolicy",
                UPDATE_PAYMENT_DATA: { actions: "updatePaymentData" },
            },
        },
        completed: {
            type: "final",
        },
    },
}, {
    actions: {
        updateData: assign({
            userData: (context, event) => {
                if (event && (event as any).type === "UPDATE_DATA") {
                    return { ...(context as any).userData, ...(event as any).data };
                }
                return (context as any).userData;
            },
        }),
        updateCharacterData: assign({
            characterData: (context, event) => {
                if (event && (event as any).type === "UPDATE_CHARACTER_DATA") {
                    return { ...(context as any).characterData, ...(event as any).data };
                }
                return (context as any).characterData;
            },
        }),
        updateNSFWPreferences: assign({
            nsfwPreferences: (context, event) => {
                if (event && (event as any).type === "UPDATE_NSFW_PREFERENCES") {
                    return { ...(context as any).nsfwPreferences, ...(event as any).preferences };
                }
                return (context as any).nsfwPreferences;
            },
        }),
        updatePaymentData: assign({
            paymentData: (context, event) => {
                if (event && (event as any).type === "UPDATE_PAYMENT_DATA") {
                    return { ...(context as any).paymentData, ...(event as any).data };
                }
                return (context as any).paymentData;
            },
        }),
    },
});

// Business Funnel Machine (simplified)
export const businessFunnelMachine = createMachine({
    id: "businessFunnel",
    initial: "businessCaseStudy",
    context: {
        userData: {},
        characterData: {},
        nsfwPreferences: {},
        paymentData: {},
        currentStep: 1,
        totalSteps: 12,
        funnelType: "business" as const,
        sessionId: "",
        stepHistory: [],
        validationErrors: {},
    },
    states: {
        businessCaseStudy: {
            on: {
                NEXT: "industrySelection",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        industrySelection: {
            on: {
                NEXT: "characterStyle",
                PREVIOUS: "businessCaseStudy",
                UPDATE_DATA: { actions: "updateData" },
            },
        },
        characterStyle: {
            on: {
                NEXT: "nsfwContentPolicy",
                PREVIOUS: "industrySelection",
                UPDATE_CHARACTER_DATA: { actions: "updateCharacterData" },
            },
        },
        nsfwContentPolicy: {
            on: {
                NEXT: "subscription",
                PREVIOUS: "characterStyle",
                UPDATE_NSFW_PREFERENCES: { actions: "updateNSFWPreferences" },
            },
        },
        subscription: {
            on: {
                NEXT: "completed",
                PREVIOUS: "nsfwContentPolicy",
                UPDATE_PAYMENT_DATA: { actions: "updatePaymentData" },
            },
        },
        completed: {
            type: "final",
        },
    },
}, {
    actions: {
        updateData: assign({
            userData: (context, event) => {
                if (event && (event as any).type === "UPDATE_DATA") {
                    return { ...(context as any).userData, ...(event as any).data };
                }
                return (context as any).userData;
            },
        }),
        updateCharacterData: assign({
            characterData: (context, event) => {
                if (event && (event as any).type === "UPDATE_CHARACTER_DATA") {
                    return { ...(context as any).characterData, ...(event as any).data };
                }
                return (context as any).characterData;
            },
        }),
        updateNSFWPreferences: assign({
            nsfwPreferences: (context, event) => {
                if (event && (event as any).type === "UPDATE_NSFW_PREFERENCES") {
                    return { ...(context as any).nsfwPreferences, ...(event as any).preferences };
                }
                return (context as any).nsfwPreferences;
            },
        }),
        updatePaymentData: assign({
            paymentData: (context, event) => {
                if (event && (event as any).type === "UPDATE_PAYMENT_DATA") {
                    return { ...(context as any).paymentData, ...(event as any).data };
                }
                return (context as any).paymentData;
            },
        }),
    },
});