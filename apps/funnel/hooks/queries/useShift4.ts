import { useMutation } from "@tanstack/react-query";
import { shift4Service } from "@/services/shift4-service";

export const useShift4Payment = () =>
    useMutation({
        mutationFn: (data: Shift4Payload) => shift4Service.payment(data),
    });
