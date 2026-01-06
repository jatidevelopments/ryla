import { TutorialOverlay, useTutorial } from '@ryla/ui';
import { studioTutorialSteps } from '../constants';

interface StudioTutorialProps {
  tutorial: ReturnType<typeof useTutorial>;
}

export function StudioTutorial({ tutorial }: StudioTutorialProps) {
  if (!tutorial.isActive) return null;

  return (
    <TutorialOverlay
      steps={studioTutorialSteps}
      currentStep={tutorial.currentStep}
      onNext={tutorial.next}
      onSkip={tutorial.skip}
      onComplete={tutorial.complete}
      isVisible={tutorial.isActive}
    />
  );
}

