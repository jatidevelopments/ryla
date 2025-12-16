import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

export interface SignUpPayload {
    email: string;
    password: string;
    utmOnRegistration: Record<string, string>;
    url: string;
    createCharFunnelOptions: {
        funnelOptions: Omit<FunnelSchema, "email" | "productId">;
        dtoAdultFannelV3: {
            character_options: {
                funnel: "cc_funnel_juicy";
                character: {
                    age: number;
                    sex: string;
                    body: string;
                    butt: string;
                    eyes: string;
                    kinks: string[];
                    style: string;
                    voice: string;
                    breast: string;
                    clothes: string;
                    greeting: string;
                    scenario: string;
                    ethnicity: string;
                    hair_color: string;
                    hair_style: string;
                    sex_position: string;
                    characterPrompt: string;
                };
                funnel_step: number;
            };
        };
        isCharacterGenerated: boolean;
    };
}

export interface AuthResponse {
    authToken: string;
    userId: number;
}
