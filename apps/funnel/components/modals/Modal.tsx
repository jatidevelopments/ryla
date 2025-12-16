"use client";
import { useCallback, useEffect } from "react";
import { useStore } from "@/store/state";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { clsx } from "clsx";
import { ModalTriggers } from "@/utils/enums/modal-triggers";

interface ModalProps
    extends Omit<
        React.ComponentProps<typeof DialogContent>,
        "onPointerDownOutside" | "onEscapeKeyDown"
    > {
    children: React.ReactNode[] | React.ReactNode;
    triggers: (string | number)[];
    onClose?: () => void;
    disableOutsideClick?: boolean;
}

function ClearState() {
    const open = useStore((state) => state.modal.open);
    const reset = useStore((state) => state.modal.reset);

    useEffect(() => {
        if (!open) reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return null;
}

export default function Modal({
    children,
    triggers,
    className,
    onClose,
    disableOutsideClick = false,
    ...props
}: ModalProps) {
    const open = useStore((state) => state.modal.open);
    const trigger = useStore((state) => state.modal.trigger);
    const setOpenChange = useStore((state) => state.modal.setOpenChange);

    const opened = open && triggers.includes(trigger);

    const handleOpenChange = useCallback(
        (opened: boolean) => {
            setOpenChange(opened);
            if (!opened && onClose) onClose();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [onClose],
    );

    return (
        <Dialog open={opened} onOpenChange={handleOpenChange}>
            <DialogContent
                className={clsx(
                    "max-w-full sm:max-w-[425px] bottom-0 top-auto sm:bottom-auto sm:top-[50%] translate-y-0 sm:translate-y-[-50%] rounded-b-none sm:rounded-lg",
                    "p-0",
                    className,
                )}
                onPointerDownOutside={disableOutsideClick ? (e) => e.preventDefault() : undefined}
                onEscapeKeyDown={disableOutsideClick ? (e) => e.preventDefault() : undefined}
                {...props}
            >
                <div
                    className={clsx(
                        "max-h-[95dvh]",
                        triggers.includes(ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL)
                            ? "overflow-hidden"
                            : "overflow-y-auto",
                    )}
                >
                    {children}
                </div>
            </DialogContent>
            <ClearState />
        </Dialog>
    );
}
