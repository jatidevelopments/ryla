import axios from "@/lib/axios";
import { AuthResponse, SignUpPayload } from "@/utils/types/auth";

export const authService = {
    signUp: async (data: SignUpPayload): Promise<AuthResponse> => {
        const response = await axios.post<AuthResponse>("/auth/signup/adult/v3", data);
        return response.data;
    },
};
