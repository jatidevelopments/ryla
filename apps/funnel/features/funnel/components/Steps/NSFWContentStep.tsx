import { Controller, useFormContext } from "react-hook-form";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import ButtonField from "@/features/funnel/components/Fields/ButtonField";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { booleanOptions } from "@/constants/boolean-options";
import { getStepIndexByName } from "@/features/funnel/config/steps";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";

export function NSFWContentStep() {
    const { nextStep, onChange } = useStepperContext();
    const form = useFormContext<FunnelSchema>();

    const handleNSFWSelect = (value: boolean) => {
        form.setValue("enable_nsfw", value, { shouldValidate: true });
        
        // PostHog tracking - NSFW option selected
        safePostHogCapture('funnel_option_selected', {
            step_name: 'NSFW Content',
            step_index: 27,
            option_type: 'enable_nsfw',
            option_value: String(value),
        });
        
        // Auto-advance logic: Always advance after selection
        // If NSFW is disabled, skip the preview step and go directly to Lipsync Feature
        setTimeout(() => {
            if (value === false) {
                const lipsyncIndex = getStepIndexByName("Lipsync Feature");
                if (lipsyncIndex !== undefined) {
                    onChange(lipsyncIndex);
                } else {
                    nextStep();
                }
            } else {
                nextStep();
            }
        }, 300); // Small delay to allow form state to update
    };

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center relative">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-gradient/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-40 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
                </div>

                <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px] relative z-10">
                    <div className="w-full mb-5 md:mb-[44px]">
                        <Stepper.Progress />
                    </div>

                    {/* Enhanced heading with gradient text */}
                    <h2 className="text-transparent bg-clip-text bg-primary-gradient text-2xl sm:text-3xl font-extrabold mb-8 capitalize text-center leading-tight">
                        Do you want to be able to generate Spicy Photos and Videos?
                    </h2>

                    {/* Enhanced buttons with better styling */}
                    <div className="w-full flex flex-col gap-4 mb-6">
                        {booleanOptions.map((option) => (
                            <Controller
                                key={option.id}
                                name="enable_nsfw"
                                control={form.control}
                                render={({ field }) => (
                                    <div className="relative group">
                                        <div
                                            className={`absolute -inset-0.5 rounded-xl transition-opacity duration-300 ${
                                                field.value === option.value
                                                    ? "opacity-100 bg-primary-gradient blur-sm"
                                                    : "opacity-0 group-hover:opacity-50 bg-white/20"
                                            }`}
                                        />
                                        <div className="relative">
                                            <ButtonField
                                                id={option.id.toString()}
                                                name={field.name}
                                                label={option.label}
                                                checked={field.value === option.value}
                                                onCheckedChange={() => {
                                                    field.onChange(option.value);
                                                    handleNSFWSelect(option.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                        ))}
                    </div>

                    {/* Spicy Content Info Box */}
                    <div className="w-full px-4 mb-8">
                        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                            <p className="text-white/90 text-xs text-center font-medium">
                                <span className="text-purple-400 font-semibold">Spicy</span> content is intended for mature audiences only
                            </p>
                        </div>
                    </div>
                </div>

                {/* Enhanced bottom section */}
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100 backdrop-blur-sm border-t border-white/5">
                    <div className="max-w-[450px] w-full">
                        <p className="text-white/60 text-xs font-medium text-center flex items-center justify-center gap-2">
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                            Unlock unlimited content generation possibilities
                            <span className="inline-block w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
