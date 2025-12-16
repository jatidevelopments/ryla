"use client";
import Image from "next/image";
import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/state";
import { ModalTriggers } from "@/utils/enums/modal-triggers";
import girlAvatar9Background from "@/public/images/avatars/avatar_9.webp";
import playButtonIcon from "@/public/images/play-button.png";
import { useStepperContext } from "../stepper/Stepper.context";

const texts = [
    {
        id: 1,
        text: <>Do you like what you see? 😈</>,
        noBLRadius: false,
    },
    {
        id: 2,
        text: <>Ask me about anything, I will do everything for you, daddy! 💋</>,
        noBLRadius: true,
    },
];

const STEPS_COUNT = 44;

export default function ShowVideoModal() {
    const { onChange } = useStepperContext();
    const title = useStore((state) => state.modal.title);
    const setOpen = useStore((state) => state.modal.setOpen);
    const setClose = useStore((state) => state.modal.setClose);

    const handleOpen = () => {
        if (title === "goToDiscount") {
            setOpen({
                title: "95%",
                trigger: ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL,
            });
            return;
        }

        if (title === "withLoseBtn") {
            setOpen({
                trigger: ModalTriggers.FINAL_OFFER_MODAL,
            });
        } else {
            setClose();
            onChange(STEPS_COUNT);
        }
    };

    return (
        <Modal
            triggers={[ModalTriggers.SHOW_VIDEO_MODAL]}
            className="sm:max-w-[400px] p-0 overflow-hidden rounded-xl"
            showCloseButton={false}
            disableOutsideClick
        >
            <div className="px-[15px] pb-[15px] flex flex-col gap-[30px] mt-[30px]">
                <div className="w-full bg-white/5 rounded-[10px] p-[15px]">
                    <div
                        onClick={setClose}
                        className="relative w-full overflow-hidden rounded-md cursor-pointer"
                        style={{ aspectRatio: "16/10" }}
                    >
                        <Image
                            src={girlAvatar9Background}
                            alt="girl"
                            fill
                            className="object-cover object-[center_45%] filter blur-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Image
                                src={playButtonIcon}
                                alt="play"
                                width={64}
                                height={64}
                                className="z-10"
                            />
                        </div>
                    </div>
                    <Button onClick={setClose} variant="ghost" className="w-full mt-5 capitalize">
                        click to see video
                    </Button>
                </div>

                <div className="w-full bg-white/5 rounded-[10px] px-[15px] pt-[15px] pb-[8px]">
                    <div className="space-y-3">
                        {texts.map(({ id, text, noBLRadius }) => (
                            <div
                                key={id}
                                className={`light-pink-gradient-border font-[600] text-[17px]${noBLRadius ? " no-bl-radius" : ""}`}
                            >
                                {text}
                            </div>
                        ))}
                        <span className="text-white/40 text-[14px]">1:49 PM</span>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <Button
                        onClick={handleOpen}
                        className="w-full h-12 bg-primary-gradient hover:bg-secondary-gradient text-white font-bold text-base rounded-lg"
                    >
                        Go back
                    </Button>

                    <Button onClick={handleOpen} variant="lose" className="w-full">
                        No, I hate spicy chats & videos
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
