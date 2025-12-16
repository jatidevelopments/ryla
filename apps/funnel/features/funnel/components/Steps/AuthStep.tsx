"use client";

import { Controller } from "react-hook-form";
import { Loader2Icon } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import CustomInput from "@/components/CustomInput";
import SpriteIcon from "@/components/SpriteIcon/SpriteIcon";

import { useSignUpForm } from "@/features/funnel/hooks/useSignUpForm";
import { usePostHog } from "posthog-js/react";

import { CHECKBOXES } from "@/constants/auth-checkboxes";
import Image from "next/image";

export function AuthStep() {
    const posthog = usePostHog();
    const { form, onSubmit, onValueReset, isPending, apiError } = useSignUpForm(posthog);

    const errors = form.formState.errors;

    return (
        <div className="w-full flex flex-col min-h-screen px-[15px] pt-[25px] sm:px-10 sm:pt-[40px] pb-[70px]">
            <div className="max-w-[360px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
                <form
                    onSubmit={onSubmit}
                    className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px]"
                >
                    <SpriteIcon
                        src={"/images/logo.svg"}
                        fallbackAlt={"My Ryla AI"}
                        targetW={35}
                        targetH={35}
                        fit="contain"
                        className="mb-5"
                    />

                    <div className="text-white text-2xl font-bold text-center mb-[30px]">
                        Achieve your goals with <br />
                        <span className="text-transparent bg-clip-text bg-primary-gradient">
                            Ryla.ai
                        </span>
                    </div>

                    <div className="w-full">
                        <div className="w-full flex flex-col gap-[10px] mb-10">
                            <div>
                                <Label className="text-white/70 mb-2.5" htmlFor="email">
                                    Enter your email to create a personal account
                                </Label>
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field }) => (
                                        <CustomInput
                                            id="email"
                                            icon={
                                                <Image
                                                    src="/icons/mail-icon.svg"
                                                    alt="Mail Icon"
                                                    width={22}
                                                    height={22}
                                                    className="w-[22px] h-[22px] invert brightness-0"
                                                    sizes="22px"
                                                    loading="lazy"
                                                    quality={85}
                                                />
                                            }
                                            type="email"
                                            placeholder="Email"
                                            value={field.value}
                                            onChange={field.onChange}
                                            isError={apiError?.message}
                                            resetInput={() => onValueReset("email")}
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <CustomInput
                                            id="password"
                                            icon={
                                                <Image
                                                    src="/icons/lock-icon.svg"
                                                    alt="Lock Icon"
                                                    width={22}
                                                    height={22}
                                                    className="w-[22px] h-[22px] invert brightness-0"
                                                    sizes="22px"
                                                    loading="lazy"
                                                    quality={85}
                                                />
                                            }
                                            type="password"
                                            placeholder={"Password"}
                                            value={field.value}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                form.trigger("password");
                                            }}
                                            isError={errors.password?.message}
                                            resetInput={() => onValueReset("password")}
                                            isSuccess={
                                                fieldState.isDirty && !errors?.password?.message
                                            }
                                        />
                                    )}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {CHECKBOXES.map(({ name, id, label }) => (
                                <div key={name}>
                                    <div className="flex gap-[10px]">
                                        <Controller
                                            name={name}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    id={id}
                                                    name={field.name}
                                                    checked={Boolean(field.value)}
                                                    onCheckedChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    className="cursor-pointer"
                                                />
                                            )}
                                        />
                                        <Label
                                            htmlFor={id}
                                            className="text-white/50 text-xs cursor-pointer"
                                        >
                                            {label}
                                        </Label>
                                    </div>
                                    {errors[name] && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors[name]?.message as string}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button
                            type={"submit"}
                            disabled={isPending}
                            className={"w-full h-[45px] bg-primary-gradient mb-[30px]"}
                        >
                            {isPending && <Loader2Icon className="animate-spin" />}
                            <span className={"text-base font-bold"}>Save And Continue</span>
                        </Button>

                        <div className="w-full p-2.5 bg-[#222327]/90 border border-white/6 rounded-[10px]">
                            <div className="flex gap-2 items-center justify-between">
                                <div className="flex-1 flex items-center relative">
                                    <SpriteIcon
                                        src={"/images/avatars/avatar_2.webp"}
                                        fallbackAlt={"Avatar 1"}
                                        targetW={31}
                                        targetH={31}
                                        fit="cover"
                                        frame
                                        center={false}
                                        className="size-[31px]"
                                        imageClassName="rounded-full border-[3px] border-[#2B2A2B] origin-[50%_20%]"
                                    />
                                    <SpriteIcon
                                        src={"/images/avatars/avatar_7.webp"}
                                        fallbackAlt={"Avatar 2"}
                                        targetW={31}
                                        targetH={31}
                                        fit="cover"
                                        frame
                                        center={false}
                                        className="size-[31px] relative -left-[12px]"
                                        imageClassName="rounded-full border-[3px] border-[#2B2A2B] origin-[50%_20%]"
                                    />
                                    <SpriteIcon
                                        src={"/images/avatars/avatar_8.webp"}
                                        fallbackAlt={"Avatar 3"}
                                        targetW={31}
                                        targetH={31}
                                        fit="cover"
                                        frame
                                        center={false}
                                        className="size-[31px] relative -left-[24px]"
                                        imageClassName="rounded-full border-[3px] border-[#2B2A2B] origin-[50%_20%]"
                                    />

                                    <div className="size-[31px] relative -left-[36px] rounded-full border-[3px] border-[#2B2A2B] bg-primary-gradient">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-white text-[11px] font-bold">
                                                3M+
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={"flex-1 text-white text-[10px] font-bold uppercase"}
                                >
                                    3M+ happy users
                                </div>

                                <div className={"relative flex-1"}>
                                    <SpriteIcon
                                        src={"/images/award-ranking.svg"}
                                        fallbackAlt={"#1 RANKED NSFW AI APP"}
                                        targetW={126}
                                        targetH={38}
                                        fit="contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AuthStep;
