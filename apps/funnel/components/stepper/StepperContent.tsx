import { PropsWithChildren } from "react";
import { clsx } from "clsx";

import { useStepperContext } from "./Stepper.context";

export type StepperContentProps = PropsWithChildren;

export default function StepperContent({ children }: StepperContentProps) {
    const { classNames } = useStepperContext();

    return <div className={clsx("", classNames?.content)}>{children}</div>;
}
