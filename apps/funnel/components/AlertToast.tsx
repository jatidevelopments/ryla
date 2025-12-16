"use client";

import React from "react";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { withCdn } from "@/lib/cdn";

interface ToastProps {
    id: string | number;
    title: string;
    description?: string;
    type?: string;
    button?: {
        label: any;
        onClick: () => void;
    };
}

export enum toastType {
    default = "default",
    success = "success",
    warning = "warning",
    error = "error",
}

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
export const triggerToast = (toast: Omit<ToastProps, "id">) => {
    return sonnerToast.custom((id) => (
        <Toast
            id={id}
            title={toast.title}
            type={toast.type}
            description={toast.description}
            button={{
                label: <Image src={withCdn("/icons/cross-icon.svg")} alt="Close" width={16} height={16} className="w-4 h-4" />,
                onClick: () => {},
            }}
        />
    ));
};

/** A fully custom toast that still maintains the animations and interactions. */
const Toast = (props: ToastProps) => {
    const { title, description, button, type = toastType.default, id } = props;

    return (
        <div className="relative overflow-hidden flex rounded-xl bg-smooth-gray shadow-lg ring-1 ring-black/5 w-full md:max-h-[80px] h-[80px] md:max-w-[364px] items-center p-4">
            <div className="flex flex-1 items-center gap-x-3">
                {type === toastType.success && (
                    <>
                        <div className="absolute -top-5 -left-5 w-[100px] h-[100px] bg-green-700 rounded-full blur-3xl" />
                        <Image
                            src={withCdn("/icons/success-icon.svg")}
                            alt="Icon"
                            width={20}
                            height={20}
                            className="w-5 h-5 "
                        />
                    </>
                )}
                {type === toastType.error && (
                    <>
                        <div className="absolute -top-5 -left-5 w-[100px] h-[100px] bg-pink-red rounded-full blur-3xl" />
                        <Image src={withCdn("/icons/error-icon.svg")} alt="Icon" width={20} height={20} className="w-5 h-5" />
                    </>
                )}
                {type === toastType.warning && (
                    <>
                        <div className="absolute -top-5 -left-5 w-[100px] h-[100px] bg-yellow-700 rounded-full blur-3xl" />
                        <Image src={withCdn("/icons/info-icon.svg")} alt="Icon" width={20} height={20} className="w-5 h-5" />
                    </>
                )}

                <div className="w-full">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    {description && <p className="mt-1 text-sm text-white">{description}</p>}
                </div>
            </div>
            <div className="ml-5 shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
                <Button
                    className="rounded-[6px] h-[30px] w-[30px] bg-transparent px-3 py-1 hover:bg-zinc-600"
                    onClick={() => {
                        button?.onClick();
                        sonnerToast.dismiss(id);
                    }}
                >
                    {button?.label}
                </Button>
            </div>
        </div>
    );
};
