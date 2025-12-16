import { Children, PropsWithChildren, ReactElement } from "react";
import { clsx } from "clsx";

import { useStepperContext } from "./Stepper.context";
import StepperContent, { StepperContentProps } from "./StepperContent";
import StepperCompleted, { StepperCompletedProps } from "./StepperCompleted";

export default function StepperContents({ children }: PropsWithChildren) {
    const { value, classNames } = useStepperContext();

    const convertedChildren = Children.toArray(children) as ReactElement[];
    const _children = convertedChildren.filter(
        (child) => child.type === StepperContent,
    ) as ReactElement<StepperContentProps>[];
    const completedStep = convertedChildren.find(
        (item) => item.type === StepperCompleted,
    ) as ReactElement<StepperCompletedProps>;

    const stepContent = _children[value]?.props?.children;
    const completedContent = completedStep?.props?.children;
    const content = value > _children.length - 1 ? completedContent : stepContent;

    return <div className={clsx("", classNames?.contents)}>{content}</div>;
}
