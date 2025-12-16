import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { SignUpPayload } from "@/utils/types/auth";

export const useSignUp = () =>
    useMutation({
        mutationFn: (data: SignUpPayload) => authService.signUp(data),
    });
