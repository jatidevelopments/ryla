"use client";
import Image from "next/image";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";

import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useStore } from "@/store/state";
import { useTimer } from "@/features/funnel/hooks/useTimerCount";

import { ModalTriggers } from "@/utils/enums/modal-triggers";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

import { subscriptions } from "@/constants/subscriptions";

import girlTokioIcon from "@/public/images/backgrounds/tokio-girl.avif";
import { useEffect } from "react";
import { avatars } from "@/constants/avatars";
import { offerBenefits } from "@/constants/offerBenefits";
import { usePostHog } from "posthog-js/react";

const TIMER = 30;

export default function FinalOfferModal() {
    const trigger = useStore((state) => state.modal.trigger);
    const setClose = useStore((state) => state.modal.setClose);
    const setOpen = useStore((state) => state.modal.setOpen);
    const posthog = usePostHog();

    const isFinalOfferModalOpen = trigger === ModalTriggers.FINAL_OFFER_MODAL;

    const { progress, formattedTime, shouldShowTimer } = useTimer(TIMER, isFinalOfferModalOpen);

    const form = useFormContext<FunnelSchema>();

    // Get the subscription (we only have one now)
    const subscription = subscriptions.find((s) => s.isBestChoice) || subscriptions[0];

    useEffect(() => {
        if (isFinalOfferModalOpen) {
            form.setValue("productId", subscription.productId);
        }
    }, [isFinalOfferModalOpen, subscription.productId, form]);

    const onClaimNow = () => {
        if (typeof window !== 'undefined') {
            posthog?.capture('exit_offer_3_accepted');
        }
        setClose();
    };

    const onLoseChanceForever = () => {
        if (typeof window !== 'undefined') {
            posthog?.capture('exit_offer_3_declined');
        }
        setOpen({
            title: "",
            trigger: ModalTriggers.SHOW_VIDEO_MODAL,
        });
    };

    return (
        <Modal
            triggers={[ModalTriggers.FINAL_OFFER_MODAL]}
            className="p-0 overflow-hidden"
            showCloseButton={false}
            disableOutsideClick
        >
            <div className="relative w-full" style={{ aspectRatio: "16/7" }}>
                <Image
                    src={girlTokioIcon}
                    alt="girl tokio"
                    fill
                    className="object-cover object-[center_16%]"
                />
            </div>

            <h2 className="capitalize text-xl sm:text-2xl font-bold text-white text-center my-3 sm:my-5">
                You Unlocked The <span className="text-orange">Final Offer!</span>
            </h2>

            <div className="px-[15px] pb-[15px] flex flex-col gap-[30px]">
                <div className="w-full bg-white/5 border border-white/6 rounded-[10px] px-[10px] py-[5px] sm:py-[15px]">
                    <ul className="space-y-2 text-white/70">
                        {offerBenefits.map((item) => (
                            <li key={item.id} className="flex gap-1 sm:gap-2">
                                <span>-</span>
                                <span>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-full flex flex-col gap-[15px] mb-[30px]">
                    <div
                        key={subscription.id}
                        className={clsx(
                            "relative w-full bg-white/5 rounded-[10px]",
                            subscription.isBestChoice
                                ? "border-[2px] border-transparent bg-primary-gradient primary-shadow"
                                : "border-[2px] border-white/6",
                        )}
                    >
                        <div className="bg-[#2a2a2f] p-4 rounded-[10px] flex items-center justify-between flex-wrap sm:flex-nowrap gap-y-3 relative">
                            {subscription.isBestChoice && (
                                <div className="absolute top-[-12px] left-3 sm:left-4 bg-primary-gradient rounded-full flex items-center justify-center">
                                    <span className="text-white text-[10px] sm:text-xs font-semibold uppercase px-[10px] py-1">
                                        BEST CHOICE
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col">
                                <div className="text-white text-base sm:text-lg font-semibold leading-none">
                                    {subscription.months} {subscription.months === 1 ? 'month' : 'months'}
                                </div>
                                {subscription.saleOff > 0 && (
                                    <div className="text-coral-red text-sm font-extrabold leading-none">
                                        {subscription.saleOff}% OFF
                                    </div>
                                )}
                            </div>

                            <div className="flex items-end gap-[6px] ml-auto">
                                {subscription.regularPrice !== subscription.salePriceFull && (
                                    <div className="text-white/50 text-xl sm:text-2xl font-semibold line-through">
                                        ${subscription.regularPrice}
                                    </div>
                                )}
                                <div className="text-white text-[24px] sm:text-[32px] font-semibold leading-none">
                                    ${subscription.salePriceInDays}
                                    <span className="text-[10px] sm:text-[11px]"> / Day</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-0 sm:mb-3">
                        <div className="flex -space-x-2">
                            {avatars.map(({ src, alt, fallback }) => (
                                <Avatar size="xs" key={src}>
                                    <AvatarImage
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={src}
                                        alt={alt}
                                    />
                                    <AvatarFallback>{fallback}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>

                        <div className="text-white/70 text-[11px] font-[600] capitalize whitespace-nowrap">
                            220 users signed up today
                        </div>
                    </div>

                    <div className="relative">
                        <Button
                            onClick={onClaimNow}
                            variant="default"
                            size="bold"
                            className={clsx(
                                "w-full relative overflow-hidden transition-all duration-300",
                                shouldShowTimer && "pulse-button",
                            )}
                        >
                            {shouldShowTimer && (
                                <div
                                    className="absolute inset-0 bg-black/20 transition-all duration-1000 ease-linear"
                                    style={{ width: `${progress}%`, transformOrigin: "left" }}
                                />
                            )}

                            <span className="flex items-center justify-center gap-2 relative z-10">
                                Claim now
                                <span className="bg-black/30 px-2 py-1 rounded text-sm font-medium text-white">
                                    {formattedTime}
                                </span>
                            </span>
                        </Button>
                    </div>

                    <Button
                        variant="lose"
                        onClick={onLoseChanceForever}
                    >
                        Lose the chance forever
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
