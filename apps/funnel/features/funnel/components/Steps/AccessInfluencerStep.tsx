"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Stepper from "@/components/stepper";
import StepWrapper from "@/components/layouts/StepWrapper";
import { useStepperContext } from "@/components/stepper/Stepper.context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getBlurredCharacterImage } from "@/utils/helpers/getBlurredCharacterImage";
import {
    getBaseModelImage,
    getInfluencerImage,
    getSkinFeatureImage,
    getTattooImage,
    getPiercingImage,
    getAgeRangeImage,
    getOutfitImage,
} from "@/utils/helpers/getInfluencerImage";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import SpriteIcon from "@/components/SpriteIcon/SpriteIcon";
import { clsx } from "clsx";
import { INFLUENCER_BODY_TYPES } from "@/constants/influencer-body-types";
import { INFLUENCER_ASS_SIZES } from "@/constants/influencer-ass-sizes";
import { INFLUENCER_BREAST_TYPES } from "@/constants/influencer-breast-types";

const formatLabel = (s?: string) =>
    (s ?? "")
        .split("-")
        .join(" ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

// Short AI Influencer names (5 options)
const AI_INFLUENCER_NAMES = ["Luna", "Zara", "Aria", "Maya", "Nova"];

const getRandomInfluencerName = () => {
    const randomIndex = Math.floor(Math.random() * AI_INFLUENCER_NAMES.length);
    return AI_INFLUENCER_NAMES[randomIndex];
};

export function AccessInfluencerStep() {
    const { nextStep } = useStepperContext();
    const form = useFormContext<FunnelSchema>();
    const [influencerName] = useState(() => getRandomInfluencerName());

    // Get influencer traits
    const ethnicity = form.watch("influencer_ethnicity");
    const hair_color = form.watch("influencer_hair_color");
    const age = form.watch("influencer_age");
    const skin_color = form.watch("influencer_skin_color");
    const eye_color = form.watch("influencer_eye_color");
    const hair_style = form.watch("influencer_hair_style");
    const face_shape = form.watch("influencer_face_shape");
    const body_type = form.watch("influencer_body_type");
    const ass_size = form.watch("influencer_ass_size");
    const breast_type = form.watch("influencer_breast_type");
    const voice = form.watch("influencer_voice");
    const tattoos = form.watch("influencer_tattoos");
    const piercings = form.watch("influencer_piercings");
    const freckles = form.watch("influencer_freckles");
    const scars = form.watch("influencer_scars");
    const beauty_marks = form.watch("influencer_beauty_marks");
    const outfit = form.watch("influencer_outfit");

    // Get enabled features
    const enable_nsfw = form.watch("enable_nsfw");
    const video_content_options = form.watch("video_content_options") || [];
    const enable_lipsync = form.watch("enable_lipsync");

    // Get character preview image - prefer blurred character image for card display
    const baseModelImage = getBaseModelImage(ethnicity);
    const blurredImage = getBlurredCharacterImage(ethnicity, hair_color);
    const characterPreviewImage =
        blurredImage || baseModelImage || "/images/blurred-characters/white-brunette.webp";

    const previewRef = useRef<HTMLDivElement>(null);
    const [previewSize, setPreviewSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

    useEffect(() => {
        const el = previewRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            if (cr) setPreviewSize({ w: Math.round(cr.width), h: Math.round(cr.height) });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Helper function to get image for each trait
    const getTraitImage = (label: string, value: string): string | null => {
        if (!value) return null;

        const normalizedValue = value.toLowerCase().replace(/\s+/g, "-");

        switch (label) {
            case "Ethnicity":
                if (!ethnicity) return null;
                return getBaseModelImage(value) || null;
            case "Age":
                if (!ethnicity) return null;
                // Age is a number, need to map to age range
                const ageNum = parseInt(value);
                if (ageNum >= 18 && ageNum <= 25) return getAgeRangeImage(ethnicity, "18-25");
                if (ageNum >= 26 && ageNum <= 33) return getAgeRangeImage(ethnicity, "26-33");
                if (ageNum >= 34 && ageNum <= 41) return getAgeRangeImage(ethnicity, "34-41");
                if (ageNum >= 42 && ageNum <= 50) return getAgeRangeImage(ethnicity, "42-50");
                return null;
            case "Skin Color":
                if (!ethnicity) return null;
                return getInfluencerImage("skin-colors", ethnicity, normalizedValue);
            case "Eye Color":
                if (!ethnicity) return null;
                return getInfluencerImage("eye-colors", ethnicity, normalizedValue);
            case "Hair Style":
                if (!ethnicity) return null;
                return getInfluencerImage("hair-styles", ethnicity, normalizedValue);
            case "Hair Color":
                if (!ethnicity) return null;
                return getInfluencerImage("hair-colors", ethnicity, normalizedValue);
            case "Face Shape":
                if (!ethnicity) return null;
                return getInfluencerImage("face-shapes", ethnicity, normalizedValue);
            case "Body Type":
                // Get image from INFLUENCER_BODY_TYPES constant
                // Use lowercase value directly for matching
                const bodyTypeValue = value.toLowerCase();
                const bodyType = INFLUENCER_BODY_TYPES.find((type) => type.value === bodyTypeValue);
                return bodyType?.image.src || null;
            case "Ass Size":
                // Get image from INFLUENCER_ASS_SIZES constant
                const assSizeValue = value.toLowerCase();
                const assSize = INFLUENCER_ASS_SIZES.find((size) => size.value === assSizeValue);
                return assSize?.image.src || null;
            case "Breast Type":
                // Get image from INFLUENCER_BREAST_TYPES constant
                const breastTypeValue = value.toLowerCase();
                const breastType = INFLUENCER_BREAST_TYPES.find(
                    (type) => type.value === breastTypeValue,
                );
                return breastType?.image.src || null;
            case "Freckles":
                return getSkinFeatureImage("freckles", normalizedValue);
            case "Scars":
                return getSkinFeatureImage("scars", normalizedValue);
            case "Beauty Marks":
                return getSkinFeatureImage("beauty-marks", normalizedValue);
            case "Tattoos":
                return getTattooImage(normalizedValue);
            case "Piercings":
                return getPiercingImage(normalizedValue);
            case "Outfit":
                return getOutfitImage(normalizedValue);
            default:
                return null;
        }
    };

    // Build traits array with images (Voice moved to last position)
    const traits = [
        ethnicity && { label: "Ethnicity", value: formatLabel(ethnicity), rawValue: ethnicity },
        age && { label: "Age", value: formatLabel(String(age)), rawValue: String(age) },
        skin_color && { label: "Skin Color", value: formatLabel(skin_color), rawValue: skin_color },
        eye_color && { label: "Eye Color", value: formatLabel(eye_color), rawValue: eye_color },
        hair_style && { label: "Hair Style", value: formatLabel(hair_style), rawValue: hair_style },
        hair_color && { label: "Hair Color", value: formatLabel(hair_color), rawValue: hair_color },
        face_shape && { label: "Face Shape", value: formatLabel(face_shape), rawValue: face_shape },
        body_type && { label: "Body Type", value: formatLabel(body_type), rawValue: body_type },
        ass_size && { label: "Ass Size", value: formatLabel(ass_size), rawValue: ass_size },
        breast_type && {
            label: "Breast Type",
            value: formatLabel(breast_type),
            rawValue: breast_type,
        },
        outfit && { label: "Outfit", value: formatLabel(outfit), rawValue: outfit },
        tattoos && { label: "Tattoos", value: formatLabel(tattoos), rawValue: tattoos },
        piercings && { label: "Piercings", value: formatLabel(piercings), rawValue: piercings },
        freckles && { label: "Freckles", value: formatLabel(freckles), rawValue: freckles },
        scars && { label: "Scars", value: formatLabel(scars), rawValue: scars },
        beauty_marks && {
            label: "Beauty Marks",
            value: formatLabel(beauty_marks),
            rawValue: beauty_marks,
        },
        voice && { label: "Voice", value: formatLabel(voice), rawValue: voice },
    ]
        .filter((trait): trait is { label: string; value: string; rawValue: string } =>
            Boolean(trait),
        )
        .map((trait) => ({
            ...trait,
            image: getTraitImage(trait.label, trait.rawValue),
        }));

    // Build enabled features array (currently unused, kept for future use)
    // const enabledFeatures = [
    //     enable_nsfw && "NSFW Content",
    //     enable_lipsync && "Lipsync Videos",
    //     video_content_options.includes("selfies") && "Hyper Realistic Selfies",
    //     video_content_options.includes("viral-videos") && "Viral Social Videos",
    //     video_content_options.includes("faceswap") && "Faceswap Character",
    //     "Unlimited Generations",
    //     "Character Consistency",
    //     "Platform Integrations",
    // ].filter(Boolean) as string[];

    return (
        <StepWrapper>
            <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col relative">
                {/* Premium background effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-500/15 to-pink-500/15 rounded-full blur-3xl" />
                </div>

                {/* Sticky Header - Sticks to top */}
                <div className="sticky top-0 z-50 w-full bg-black-2/95 backdrop-blur-md border-b border-white/10 -mx-5 sm:-mx-10 px-5 sm:px-10 pt-5 md:pt-[40px] pb-4 mb-4">
                    <div className="w-full">
                        <Stepper.Progress />
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full flex-1 flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px] relative z-10">
                    <div className="w-full px-4 flex flex-col gap-4">
                        {/* Header Section - Premium Design */}
                        <div className="text-center mb-2">
                            <h2 className="text-purple-400 text-sm font-semibold mb-3">
                                Your AI Influencer is Ready
                            </h2>
                            <p className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Access Unlocked!
                            </p>
                        </div>

                        {/* AI Influencer Character Card */}
                        <div className="relative mb-4">
                            {/* Premium Card Container */}
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-sm">
                                {/* Gradient Background - Purple/Pink Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 via-pink-500/40 to-purple-600/50" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                                {/* Card Content */}
                                <div className="relative p-5 flex flex-col sm:flex-row gap-4">
                                    {/* Character Image Section */}
                                    <div className="flex-shrink-0 flex justify-center sm:justify-start">
                                        <div
                                            ref={previewRef}
                                            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl ring-1 ring-white/20 bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                                        >
                                            {previewSize.w > 0 && previewSize.h > 0 ? (
                                                <SpriteIcon
                                                    src={characterPreviewImage}
                                                    fallbackAlt="character-preview"
                                                    targetW={previewSize.w}
                                                    targetH={previewSize.h}
                                                    fit="cover"
                                                    center={false}
                                                    className="w-full h-full rounded-xl"
                                                    imageClassName="w-full h-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                <Image
                                                    src={
                                                        characterPreviewImage ||
                                                        "/images/blurred-characters/white-brunette.webp"
                                                    }
                                                    alt="character-preview"
                                                    fill
                                                    className="object-cover rounded-xl"
                                                    sizes="(max-width: 768px) 100vw, 450px"
                                                    loading="lazy"
                                                    quality={85}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src =
                                                            "/images/blurred-characters/white-brunette.webp";
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Character Info Section */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        {/* Top Section - Character Type & Name */}
                                        <div className="mb-3">
                                            <div className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                                                AI Influencer
                                            </div>
                                            <div className="text-white text-xl sm:text-2xl font-extrabold mb-2">
                                                {influencerName}
                                            </div>
                                        </div>

                                        {/* Main Message - Styled like the image */}
                                        <div className="mb-3 space-y-1">
                                            <p className="text-white text-sm sm:text-base font-bold leading-tight">
                                                Hey, I&apos;m your AI Influencer
                                            </p>
                                            <p className="text-white/70 text-sm font-medium leading-tight">
                                                Ready to create content and monetize 24/7
                                            </p>
                                        </div>

                                        {/* Bottom Section - Branding */}
                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/20">
                                            <div className="text-white/90 text-xs font-semibold">
                                                Ryla.ai
                                            </div>
                                            <div className="text-white/70 text-xs font-medium">
                                                Premium AI
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subtle shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            </div>
                        </div>

                        {/* Character Attributes - Grid Layout (All Visible) */}
                        {traits.length > 0 && (
                            <div className="mb-2">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider">
                                        Character Overview
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {traits.map((trait, index) => (
                                        <div
                                            key={index}
                                            className={clsx(
                                                "group relative rounded-xl p-2.5 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.05] hover:shadow-lg overflow-hidden",
                                                "bg-gradient-to-br from-white/10 via-white/6 to-white/3 border-white/15 hover:border-white/25",
                                                index % 6 === 0 && "hover:shadow-purple-500/20",
                                                index % 6 === 1 && "hover:shadow-blue-500/20",
                                                index % 6 === 2 && "hover:shadow-green-500/20",
                                                index % 6 === 3 && "hover:shadow-orange-500/20",
                                                index % 6 === 4 && "hover:shadow-pink-500/20",
                                                index % 6 === 5 && "hover:shadow-cyan-500/20",
                                            )}
                                        >
                                            {/* Background Image on Right Side */}
                                            {trait.image && (
                                                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-xl overflow-hidden opacity-30 group-hover:opacity-50 transition-opacity">
                                                    <Image
                                                        src={trait.image}
                                                        alt={trait.label}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                        loading="lazy"
                                                        quality={75}
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.style.display = "none";
                                                        }}
                                                    />
                                                    {/* Overlay gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-l from-white/10 via-transparent to-transparent" />
                                                </div>
                                            )}

                                            {/* Shimmer effect on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                            {/* Content */}
                                            <div className="relative z-10">
                                                <div className="text-white/60 text-[9px] font-bold mb-1 uppercase tracking-wider leading-tight">
                                                    {trait.label}
                                                </div>
                                                <div className="text-white text-xs font-extrabold leading-tight truncate">
                                                    {trait.value}
                                                </div>
                                            </div>

                                            {/* Corner accent */}
                                            <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-white/10 to-transparent rounded-bl-xl pointer-events-none z-20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section - Premium Design */}
                <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-5 bg-black-2/95 backdrop-blur-md sm:static fixed bottom-0 left-0 z-100 border-t border-white/10">
                    <div className="max-w-[450px] w-full">
                        <Button
                            onClick={nextStep}
                            className="w-full h-[50px] bg-primary-gradient hover:opacity-95 hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-purple-500/40 text-base font-bold rounded-xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                <Image
                                    src="/icons/magic-wand-icon.svg"
                                    alt="Magic Wand"
                                    width={22}
                                    height={22}
                                    className="w-5 h-5 invert brightness-0"
                                    sizes="22px"
                                    loading="lazy"
                                    quality={85}
                                />
                                <span>Let's Make Her Viral Today</span>
                            </div>
                        </Button>
                        <p className="text-white/50 text-xs font-medium text-center mt-3 flex items-center justify-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                            Everything you need to create, monetize, and grow
                            <span className="w-1 h-1 rounded-full bg-primary-gradient animate-pulse" />
                        </p>
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
