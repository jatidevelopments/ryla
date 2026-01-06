'use client';

import { Button, Textarea, DialogTitle, DialogDescription } from '@ryla/ui';

interface FeedbackStepProps {
  feedback: string;
  onFeedbackChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function FeedbackStep({
  feedback,
  onFeedbackChange,
  onContinue,
  onBack,
}: FeedbackStepProps) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <DialogTitle className="text-xl font-semibold">Any feedback?</DialogTitle>
        <DialogDescription className="mt-2 text-white/50">
          Optional – help us do better
        </DialogDescription>
      </div>

      <Textarea
        value={feedback}
        onChange={(e) => onFeedbackChange(e.target.value)}
        placeholder="What could we have done better?"
        className="min-h-[120px] resize-none rounded-xl bg-white/[0.03] border-white/[0.08] placeholder:text-white/30 focus:border-white/20"
      />

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

