import { clsx } from "clsx";
import { ComponentProps } from "react";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Props extends ComponentProps<typeof Checkbox> {
    label: string;
}

export default function BadgeField({ id, name, label, checked, onCheckedChange }: Props) {
    return (
        <Label
            htmlFor={id}
            className={clsx(
                "cursor-pointer w-fit h-[33px] p-[1px] flex items-center justify-center rounded-full",
                checked ? "bg-primary-gradient" : "bg-white/6",
            )}
        >
            <div
                className={clsx(
                    "w-full px-[15px] h-full flex flex-col items-center justify-center rounded-full",
                    checked ? "bg-[#353539]" : "bg-[#2a2a2f]",
                )}
            >
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
