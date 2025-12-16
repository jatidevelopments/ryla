import { clsx } from "clsx";
import { ComponentProps } from "react";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import usePlayAudio from "@/hooks/usePlayAudio";
import Image from "next/image";

interface Props extends ComponentProps<typeof Checkbox> {
    label: string;
    voiceUrl: string;
}

export default function VoiceField({ id, name, label, voiceUrl, checked, onCheckedChange }: Props) {
    const play = usePlayAudio(voiceUrl);

    return (
        <Label
            htmlFor={id}
            onClick={play}
            className={clsx(
                "cursor-pointer w-full min-h-[54px] p-[1px] flex items-center rounded-[10px]",
                checked ? "bg-primary-gradient" : "bg-white/6",
            )}
        >
            <div
                className={clsx(
                    "w-full px-[15px] h-full flex items-center gap-[10px] rounded-[10px]",
                    checked ? "bg-[#353539]" : "bg-[#2a2a2f]",
                )}
            >
                <div
                    className={clsx(
                        "w-[25px] h-[25px] flex-shrink-0 flex items-center justify-center rounded-full",
                        checked ? "bg-primary-gradient" : "bg-white/10",
                    )}
                >
                    <Image
                        src="/icons/voice-icon.svg"
                        alt="Voice Icon"
                        width={16}
                        height={16}
                        className="w-[16px] h-[16px] invert brightness-0"
                    />
                </div>

                <div className={"text-white text-base font-medium"}>{label}</div>
                <Checkbox
                    id={id}
                    name={name}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    className={"invisible h-0 w-0"}
                />
            </div>
        </Label>
    );
}
