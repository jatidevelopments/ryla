import { clsx } from "clsx";
import { ComponentProps } from "react";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Props extends ComponentProps<typeof Checkbox> {
    label: string;
    description?: string | null;
}

export default function ButtonField({
    id,
    name,
    label,
    description,
    checked,
    onCheckedChange,
}: Props) {
    return (
        <Label
            htmlFor={id}
            className={clsx(
                "cursor-pointer w-full min-h-[54px] p-[1px] flex items-center rounded-[10px]",
                checked ? "bg-primary-gradient" : "bg-white/6",
                description || description === null ? "h-[60px]" : "h-[54px]",
            )}
        >
            <div
                className={clsx(
                    "w-full px-[15px] h-full flex flex-col items-center justify-center rounded-[10px]",
                    checked ? "bg-[#353539]" : "bg-[#2a2a2f]",
                )}
            >
                <div className={"text-white text-base font-medium"}>{label}</div>
                {description && <div className={"text-white/70 text-xs"}>{description}</div>}
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
