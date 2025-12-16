"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Modal from "@/components/modals/Modal";

import { useStore } from "@/store/state";

import { ModalTriggers } from "@/utils/enums/modal-triggers";

import fireworksIcon from "@/public/images/fireworks.png";

const DEFAULT_GIF_KEY = 0;
const PAUSE_FOR_STEP = 1000;
const AUTO_CLICK_DELAY = 3000;

const FinalOfferUnlockedModal = () => {
    const { trigger, open, setOpen, title } = useStore((state) => state.modal);
    const [step, setStep] = useState<"none" | "first" | "second">("none");
    const [gifKey, setGifKey] = useState<number>(DEFAULT_GIF_KEY);

    const openModal = () => {
        setOpen({
            trigger: title === "80%" ? ModalTriggers.SECRET_OFFER : ModalTriggers.FINAL_OFFER_MODAL,
        });
    };

    useEffect(() => {
        let stepTimer: NodeJS.Timeout;
        let autoClickTimer: NodeJS.Timeout;

        if (open && trigger === ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL) {
            setGifKey((prev) => prev + 1);
            setStep("first");

            stepTimer = setTimeout(() => {
                setStep("second");
            }, PAUSE_FOR_STEP);

            autoClickTimer = setTimeout(() => {
                openModal();
            }, AUTO_CLICK_DELAY);
        } else {
            setStep("none");
        }

        return () => {
            clearTimeout(stepTimer);
            clearTimeout(autoClickTimer);
        };
    }, [open, trigger]);

    return (
        <Modal
            triggers={[ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL]}
            showCloseButton={false}
            disableOutsideClick
            className="
                p-0 overflow-hidden rounded-2xl bg-transparent
                backdrop-blur-sm
                dark-pink-gradient-bg
                top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                h-[250px] sm:h-[350px] w-full max-w-[350px]
            "
        >
            <div className="flex flex-col justify-between h-full relative items-center">
                <AnimatePresence mode="wait">
                    {step === "first" && (
                        <motion.div
                            key="first-part"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col justify-between h-full w-full items-center"
                        >
                            <div className="flex justify-center items-center w-full">
                                <img
                                    key={gifKey}
                                    src={`/gifs/percentage.gif?v=${gifKey}`}
                                    alt="Secret Offer Icon"
                                    className="object-contain opacity-70 h-[170px] sm:h-[270px] w-auto"
                                />
                            </div>
                            <h2 className="capitalize text-2xl font-bold text-white text-center mb-5 px-3">
                                secret offer unlocked
                            </h2>
                        </motion.div>
                    )}

                    {step === "second" && (
                        <motion.div
                            key="second-part"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="relative h-full w-full"
                        >
                            <Image
                                src={fireworksIcon}
                                alt="Secret Offer Icon"
                                height={280}
                                className="object-contain opacity-70"
                            />

                            <div className="absolute inset-0 top-10 flex flex-col items-center justify-center w-full px-3 text-center">
                                <h2 className="capitalize text-[32px] font-bold text-white mb-4">
                                    Your Final Offer
                                </h2>

                                <div className="uppercase text-[35px] px-16 font-bold gradient-pink">
                                    {title} OFF
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};

export default FinalOfferUnlockedModal;
