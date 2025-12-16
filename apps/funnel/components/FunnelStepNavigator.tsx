"use client";

import { useState, useEffect, useContext } from "react";
import { useFormContext } from "react-hook-form";
import { StepperContext } from "@/components/stepper/Stepper.context";
import { ChevronLeft, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { INFLUENCER_AGE } from "@/constants/influencer-age";
import { INFLUENCER_EYES_COLORS } from "@/constants/influencer-eyes-colors";
import { ethnicity } from "@/constants/ethnicity";
import { INFLUENCER_HAIR_STYLES } from "@/constants/influencer-hair-styles";
import { INFLUENCER_HAIR_COLORS } from "@/constants/influencer-hair-colors";
import { INFLUENCER_FACE_SHAPES } from "@/constants/influencer-face-shapes";
import { INFLUENCER_BODY_TYPES } from "@/constants/influencer-body-types";
import { INFLUENCER_VOICES } from "@/constants/influencer-voices";
import { INFLUENCER_ASS_SIZES } from "@/constants/influencer-ass-sizes";
import { INFLUENCER_BREAST_TYPES } from "@/constants/influencer-breast-types";
import { VIDEO_CONTENT_OPTIONS } from "@/constants/video-content-options";
import { type StepInfo } from "@/features/funnel/config/steps";
import { useOrderedSteps } from "@/hooks/useOrderedSteps";

function StepItem({
    step,
    isCurrent,
    isCompleted,
    form,
    formatFormValue,
    getStepTypeBadge,
    isExpanded,
    handleStepClick,
}: {
    step: StepInfo;
    isCurrent: boolean;
    isCompleted: boolean;
    form: ReturnType<typeof useFormContext<FunnelSchema>> | null;
    formatFormValue: (step: StepInfo, formData: FunnelSchema | null) => string | null;
    getStepTypeBadge: (type?: string) => React.ReactNode;
    isExpanded: boolean;
    handleStepClick: (stepIndex: number) => void;
}) {
    return (
        <div className="relative w-full">
            <button
                onClick={() => handleStepClick(step.index)}
                className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded transition-all",
                    "hover:bg-white/5",
                    isCurrent && "bg-white/5",
                )}
            >
                {/* Step Indicator */}
                <div
                    className={cn(
                        "shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                        "transition-all text-[10px] font-semibold",
                        isCurrent
                            ? "bg-purple-500 text-white"
                            : isCompleted
                              ? "bg-white/10 text-white/50"
                              : "bg-white/5 text-white/30",
                    )}
                >
                    {isCompleted ? (
                        <Check size={12} className="text-green-400" strokeWidth={3} />
                    ) : (
                        <span>{step.index + 1}</span>
                    )}
                </div>

                {/* Step Content - Only show when expanded */}
                {isExpanded && (
                    <div className="flex-1 min-w-0 text-left flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <span
                                className={cn(
                                    "text-xs font-medium truncate block flex-1",
                                    isCurrent
                                        ? "text-white"
                                        : isCompleted
                                          ? "text-white/50"
                                          : "text-white/30",
                                )}
                            >
                                {step.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {step.type && (
                                <div className="flex items-center">
                                    {getStepTypeBadge(step.type)}
                                </div>
                            )}
                            {/* Show selected value badge for completed input steps */}
                            {step.type === "input" &&
                                isCompleted &&
                                form &&
                                (() => {
                                    const formValues = form.getValues();
                                    const selectedValue = formatFormValue(step, formValues);
                                    return selectedValue ? (
                                        <span
                                            className={cn(
                                                "px-1.5 py-0.5 rounded text-[9px] font-medium",
                                                "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
                                                "truncate max-w-[100px]",
                                            )}
                                            title={selectedValue}
                                        >
                                            {selectedValue}
                                        </span>
                                    ) : null;
                                })()}
                        </div>
                    </div>
                )}
            </button>
        </div>
    );
}

export function FunnelStepNavigator() {
    const [isExpanded, setIsExpanded] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("funnel-navigator-expanded");
            return saved ? JSON.parse(saved) : true;
        }
        return true;
    });

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("funnel-navigator-expanded", JSON.stringify(isExpanded));
        }
    }, [isExpanded]);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    // Get steps from config - no database needed
    const { orderedSteps } = useOrderedSteps();

    // Use useContext directly to avoid throwing errors - hooks must be called unconditionally
    const stepperContext = useContext(StepperContext);

    // Call useFormContext unconditionally - it will throw if not in FormProvider
    // This component should only be used within FormProvider, so we call it unconditionally
    // If it's not available, the component will error which is expected behavior
    const form = useFormContext<FunnelSchema>();

    // If stepper context is not available, don't render
    if (!stepperContext) {
        return null;
    }

    const { value: currentStep, onChange, max } = stepperContext;

    const handleStepClick = (stepIndex: number) => {
        onChange(stepIndex);
    };

    const handleCopyStep = async () => {
        const currentStepInfo = orderedSteps.find((step) => step.index === currentStep);
        if (currentStepInfo) {
            const textToCopy = `Step ${currentStepInfo.index + 1}: ${currentStepInfo.name}`;
            try {
                await navigator.clipboard.writeText(textToCopy);
                setCopied(true);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    // Helper function to get label from constant arrays by value
    const getLabelFromConstant = (
        value: string,
        constants: Array<{ value: string; label?: string; image?: { name?: string; src?: string; alt?: string } }>,
    ): string | null => {
        const item = constants.find((item) => item.value === value);
        // Try label first, then image.name, then value
        return item?.label || item?.image?.name || item?.value || null;
    };

    // Helper function to format form value for display
    const formatFormValue = (step: StepInfo, formData: FunnelSchema | null): string | null => {
        if (!form || !step.formField || !formData) return null;

        if (Array.isArray(step.formField)) {
            // Multiple fields - combine them
            const values = step.formField
                .map((field) => {
                    const val = formData[field];
                    if (!val || val === "" || val === undefined || val === null) return null;
                    return formatSingleValue(field, val);
                })
                .filter((v): v is string => v !== null);
            return values.length > 0 ? values.join(", ") : null;
        } else {
            const val = formData[step.formField];
            if (!val || val === "" || val === undefined || val === null) return null;
            return formatSingleValue(step.formField, val);
        }
    };

    // Helper function to format a single form value
    const formatSingleValue = (field: keyof FunnelSchema, value: any): string | null => {
        if (value === null || value === undefined || value === "") return null;

        // Handle arrays
        if (Array.isArray(value)) {
            if (value.length === 0) return null;
            if (field === "video_content_options") {
                const labels = value
                    .map((v) => {
                        const item = VIDEO_CONTENT_OPTIONS.find((item) => item.value === v);
                        return item?.label || v;
                    })
                    .filter((v): v is string => v !== null);
                return labels.length > 0 ? labels.join(", ") : null;
            }
            return value.join(", ");
        }

        // Handle booleans
        if (typeof value === "boolean") {
            if (field === "enable_nsfw") {
                return value ? "Yes" : "No";
            }
            return value ? "Enabled" : "Disabled";
        }

        // Handle strings - look up in constants
        if (typeof value === "string") {
            let label: string | null = null;

            switch (field) {
                case "creation_method":
                    return value === "upload"
                        ? "Upload Image"
                        : value === "create"
                          ? "Create AI"
                          : value;
                case "influencer_age":
                    label = getLabelFromConstant(value, INFLUENCER_AGE);
                    break;
                case "influencer_eye_color":
                    label = getLabelFromConstant(value, INFLUENCER_EYES_COLORS);
                    break;
                case "influencer_ethnicity":
                    label = getLabelFromConstant(value, ethnicity);
                    break;
                case "influencer_skin_color":
                    // Skin color formatting - add to constants if needed
                    return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
                case "influencer_hair_style":
                    label = getLabelFromConstant(value, INFLUENCER_HAIR_STYLES);
                    break;
                case "influencer_hair_color":
                    label = getLabelFromConstant(value, INFLUENCER_HAIR_COLORS);
                    break;
                case "influencer_face_shape":
                    label = getLabelFromConstant(value, INFLUENCER_FACE_SHAPES);
                    break;
                case "influencer_body_type":
                    label = getLabelFromConstant(value, INFLUENCER_BODY_TYPES);
                    break;
                case "influencer_voice":
                    label = getLabelFromConstant(value, INFLUENCER_VOICES);
                    break;
                case "influencer_ass_size":
                    label = getLabelFromConstant(value, INFLUENCER_ASS_SIZES);
                    break;
                case "influencer_breast_type":
                    label = getLabelFromConstant(value, INFLUENCER_BREAST_TYPES);
                    break;
                case "email":
                    // Email doesn't need formatting
                    return value;
            }

            // If we found a label, return it; otherwise capitalize the value
            if (label) return label;
            return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
        }

        return String(value);
    };

    // Helper function to get badge label and styling for step types
    const getStepTypeBadge = (type?: string) => {
        if (!type) return null;

        const badgeConfig = {
            input: { label: "Input", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
            info: {
                label: "Info",
                className: "bg-purple-500/20 text-purple-300 border-purple-500/30",
            },
            payment: {
                label: "Payment",
                className: "bg-green-500/20 text-green-300 border-green-500/30",
            },
            loader: {
                label: "Loader",
                className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
            },
            "social-proof": {
                label: "Social Proof",
                className: "bg-orange-500/20 text-orange-300 border-orange-500/30",
            },
        };

        const config = badgeConfig[type as keyof typeof badgeConfig];
        if (!config) return null;

        return (
            <span
                className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-medium border",
                    "uppercase tracking-wider",
                    config.className,
                )}
            >
                {config.label}
            </span>
        );
    };

    return (
        <>
            {/* Collapsed State - Small Icon in Top Left */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className={cn(
                        "fixed top-4 left-4 z-50",
                        "w-10 h-10 rounded-full",
                        "bg-black/80 hover:bg-black border border-white/10",
                        "flex items-center justify-center text-white font-semibold",
                        "transition-all backdrop-blur-sm shadow-lg",
                        "hover:scale-110",
                    )}
                    style={{ zIndex: 9999 }}
                    title="Open Navigator"
                >
                    <span className="text-sm">N</span>
                </button>
            )}

            {/* Expanded State - Full Sidebar */}
            {isExpanded && (
                <div
                    className={cn(
                        "fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out",
                        "border-r border-white/5 w-64",
                    )}
                    style={{ zIndex: 9999 }}
                >
                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsExpanded(false)}
                        className={cn(
                            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-full",
                            "w-6 h-12 bg-black/80 hover:bg-black border border-white/10 rounded-r-md",
                            "flex items-center justify-center text-white/70 hover:text-white",
                            "transition-all backdrop-blur-sm",
                        )}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Sidebar Content */}
                    <div
                        className={cn(
                            "h-full bg-black/95 backdrop-blur-sm border-r border-white/5",
                            "flex flex-col",
                        )}
                    >
                        {/* Header - Sticky at top */}
                        <div className="sticky top-0 z-10 p-5 border-b border-white/5 bg-black/95 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-white font-semibold text-sm">Navigator</h3>
                                <button
                                    onClick={handleCopyStep}
                                    className={cn(
                                        "p-1.5 rounded-md transition-all",
                                        "hover:bg-white/10 text-white/60 hover:text-white",
                                        copied && "text-green-400",
                                    )}
                                    title="Copy step number and title"
                                >
                                    {copied ? (
                                        <Check
                                            size={14}
                                            className="text-green-400"
                                            strokeWidth={3}
                                        />
                                    ) : (
                                        <Copy size={14} />
                                    )}
                                </button>
                            </div>
                            <p className="text-white/40 text-xs font-medium">
                                {currentStep + 1} / {max}
                            </p>
                        </div>

                        {/* Steps List - Scrollable */}
                        <div
                            className={cn(
                                "flex-1 overflow-y-auto overflow-x-hidden",
                                "py-3 px-3 space-y-0.5",
                                "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                            )}
                        >
                            {orderedSteps.map((step) => {
                                const isCompleted = step.index < currentStep;
                                const isCurrent = step.index === currentStep;

                                return (
                                    <StepItem
                                        key={step.name}
                                        step={step}
                                        isCurrent={isCurrent}
                                        isCompleted={isCompleted}
                                        form={form}
                                        formatFormValue={formatFormValue}
                                        getStepTypeBadge={getStepTypeBadge}
                                        isExpanded={isExpanded}
                                        handleStepClick={handleStepClick}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
