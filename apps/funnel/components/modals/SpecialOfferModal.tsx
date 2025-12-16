"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import clsx from "clsx";

import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";

import { useStore } from "@/store/state";
import { useTimer } from "@/features/funnel/hooks/useTimerCount";

import { ModalTriggers } from "@/utils/enums/modal-triggers";

import specialOfferGirlBackground from "@/public/images/backgrounds/girl.png";
import { featuresForFree } from "@/constants/featuresForFree";
import { usePostHog } from "posthog-js/react";

const TIMMER_OFFER = 30;

export default function SpecialOfferModal() {
    const [timeLeft, setTimeLeft] = useState(TIMMER_OFFER);
    const setClose = useStore((state) => state.modal.setClose);
    const setOpen = useStore((state) => state.modal.setOpen);
    const trigger = useStore((state) => state.modal.trigger);
    const setIsSpecialOfferOpened = useStore((state) => state.offer.setIsSpecialOfferOpened);
    const posthog = usePostHog();

    const { progress, shouldShowTimer } = useTimer(
        TIMMER_OFFER,
        trigger === ModalTriggers.SPECIAL_OFFER_MODAL,
    );

    useEffect(() => {
        if (trigger === ModalTriggers.SPECIAL_OFFER_MODAL) {
            setTimeLeft(TIMMER_OFFER);
        }
    }, [trigger]);

    const onOpenSpecialOffer = () => {
        if (typeof window !== 'undefined') {
            posthog?.capture('exit_offer_1_declined');
        }
        setIsSpecialOfferOpened(true);
        setOpen({ title: "80%", trigger: ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL });
    };

    const onClaimNow = () => {
        if (typeof window !== 'undefined') {
            posthog?.capture('exit_offer_1_accepted');
        }
        setClose();
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Modal
            triggers={[ModalTriggers.SPECIAL_OFFER_MODAL]}
            className="sm:max-w-[400px] p-0 overflow-hidden rounded-xl"
            showCloseButton={false}
            disableOutsideClick
        >
            <div className="relative w-full " style={{ aspectRatio: "16/9" }}>
                <Image
                    src={specialOfferGirlBackground}
                    alt="girl tokio"
                    fill
                    className="object-cover object-[center_27%]"
                />
                <div>
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-pink to-orange px-3 py-1.5 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase text-center">
                            ONLY FOR NEW USERS
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-pink-red/30 h-[35px] flex items-center justify-center px-4">
                    <div className="flex items-center gap-4 text-white">
                        <span className="text-sm font-medium">⌛ ONE TIME OFFER</span>
                        <div className="bg-black/70 px-3 py-1.5 rounded-lg h-[25px] flex items-center justify-center">
                            <span className="text-sm font-bold">{timeLeft} sec</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-black-2 px-6 pb-6 pt-3 sm:pt-6">
                <DialogHeader className="text-center mb-3 sm:mb-6">
                    <h2 className="text-white text-center text-xl sm:text-2xl font-bold mb-0 sm:mb-2">
                        Are You Sure?
                    </h2>
                    <p className="text-white/70 text-sm text-center">
                        By going away, you&apos;ll lose the opportunity to receive all listed{" "}
                        <span className="text-white font-semibold">features for free!</span>
                    </p>
                </DialogHeader>

                <div className="space-y-3 mb-4 sm:mb-6">
                    {featuresForFree.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between py-1 sm:py-3 px-3 bg-smooth-gray rounded-lg"
                        >
                            <span className="text-white text-sm font-medium">{feature.title}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-pink text-sm font-bold line-through">
                                    {feature.originalPrice}
                                </span>
                                <span className="text-salad-green text-lg font-bold">
                                    {feature.discountPrice}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-gray-1 text-xs text-center mb-4 sm:mb-6">
                    This offer is available only now, on this screen.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={onClaimNow}
                        className={clsx(
                            "w-full h-12 bg-primary-gradient hover:bg-secondary-gradient text-white font-bold text-base rounded-lg relative overflow-hidden transition-all duration-300",
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
                        </span>
                    </Button>

                    <Button onClick={onOpenSpecialOffer} variant="lose" className="w-full">
                        No, I hate discounts
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
