import { useMutation } from "@tanstack/react-query";
import { finbyService } from "@/services/finby-service";

export const useFinbySetupPayment = () =>
    useMutation({
        mutationFn: (data: FinbySetupPayload) => finbyService.setupPayment(data),
    });

