import { PropsWithChildren } from "react";

export default function StepWrapper({ children }: PropsWithChildren) {
    return (
        <div
            className={
                "w-full flex flex-col min-h-dvh md:min-h-screen md:max-h-auto px-5 sm:px-10 pt-5 md:pt-[40px] pb-[40px]"
            }
        >
            {children}
        </div>
    );
}
