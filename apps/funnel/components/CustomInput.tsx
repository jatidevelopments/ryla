/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import React, { useEffect } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import Image from "next/image";

interface ICustomInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
    value?: string;
    isError?: string;
    icon?: React.ReactNode;
    resetInput?: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type: string;
    invalidateInputState?: (value: boolean) => void;
    isSuccess?: boolean;
}
/* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */

const CustomInput = (props: ICustomInputProps) => {
    const { icon, isError, resetInput, invalidateInputState, isSuccess, ...rest } = props;

    const inputClassName =
        "border-none focus-visible:ring-0 placeholder:text-gray-1 text-white h-full p-0";

    useEffect(() => {
        if (isSuccess) {
            invalidateInputState?.(true);
        } else {
            invalidateInputState?.(false);
        }
    }, [isSuccess, invalidateInputState]);

    return (
        <div
            className={clsx(
                "flex items-center relative border-1 rounded-md bg-black px-3 w-full h-[45px]",
                isError
                    ? "border-pink-red"
                    : isSuccess
                      ? "border-salad-green"
                      : "border-smooth-gray",
            )}
        >
            {icon && <span className="mr-2 text-white">{icon}</span>}
            <Input {...rest} className={clsx(props.className, inputClassName)} />
            {isError && (
                <div className="cursor-pointer rounded-full bg-pink-red hover:bg-gray-1 p-1">
                    <X size={10} onClick={resetInput} />
                </div>
            )}
            {isSuccess && (
                <div className="cursor-pointer rounded-full hover:bg-gray-1 p-1">
                    <Image
                        src="/icons/success-icon.svg"
                        alt="Success Icon"
                        width={20}
                        height={20}
                        className="w-[20px] h-[19px] invert brightness-0"
                    />
                </div>
            )}
        </div>
    );
};

export default CustomInput;
