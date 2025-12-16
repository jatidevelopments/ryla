import { clsx } from "clsx";
import { ComponentProps } from "react";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Props extends ComponentProps<typeof Checkbox> {
    label: string;
}

export default function CheckboxField({ id, name, label, checked, onCheckedChange }: Props) {
    return (
        <Label
            htmlFor={id}
            className={clsx(
                "cursor-pointer w-full h-[54px] p-[1px] flex items-center rounded-[10px]",
                checked ? "bg-primary-gradient" : "bg-white/6",
            )}
        >
            <div
                className={clsx(
                    "w-full px-[15px] h-full flex items-center justify-between rounded-[10px]",
                    checked ? "bg-[#353539]" : "bg-[#2a2a2f]",
                )}
            >
                <span className={"text-white text-base font-medium"}>{label}</span>
                <Checkbox id={id} name={name} checked={checked} onCheckedChange={onCheckedChange} />
            </div>
        </Label>
    );
}
