import { PropsWithChildren } from "react";
import { clsx } from "clsx";

import { StepperContextProvider, StepperProps } from "./Stepper.context";
import StepperContent from "./StepperContent";
import StepperContents from "./StepperContents";
import StepperCompleted from "./StepperCompleted";
import StepperProgress from "./StepperProgress";

function StepperComponent({ children, classNames, ...rest }: PropsWithChildren<StepperProps>) {
    return (
        <StepperContextProvider {...rest} classNames={classNames}>
            <div className={clsx("", classNames?.root)}>{children}</div>
        </StepperContextProvider>
    );
}

const Stepper = Object.assign(StepperComponent, {
    Content: StepperContent,
    Contents: StepperContents,
    Completed: StepperCompleted,
    Progress: StepperProgress,
});

export default Stepper;
