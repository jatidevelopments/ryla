import { PropsWithChildren } from "react";
import { clsx } from "clsx";

import { useStepperContext } from "./Stepper.context";

export type StepperCompletedProps = PropsWithChildren;

export default function StepperCompleted({ children }: StepperCompletedProps) {
    const { classNames } = useStepperContext();

    return <div className={clsx("", classNames?.completed)}>{children}</div>;
}
