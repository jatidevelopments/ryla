'use client';

import * as React from 'react';
import { Button, Label, Dialog, DialogContent, DialogTrigger } from '@ryla/ui';
import { useDeleteAccountFlow } from './delete-account-dialog/hooks';
import {
  RetentionOfferStep,
  ReasonSelectionStep,
  FeedbackStep,
  ConfirmationStep,
} from './delete-account-dialog/components';
import type { DeleteStep } from './delete-account-dialog/constants';

interface DeleteAccountDialogProps {
  onDeleteConfirmed: () => Promise<void>;
  subscriptionTier: string;
}

export function DeleteAccountDialog({
  onDeleteConfirmed,
  subscriptionTier,
}: DeleteAccountDialogProps) {
  const [open, setOpen] = React.useState(false);

  const {
    step,
    setStep,
    feedback,
    setFeedback,
    confirmText,
    setConfirmText,
    isDeleting,
    handleOfferClick,
    handleSelectReason,
    handleFeedbackContinue,
    handleDelete,
    handleOpenChange: handleFlowOpenChange,
  } = useDeleteAccountFlow({
    subscriptionTier,
    onDeleteConfirmed: async () => {
      await onDeleteConfirmed();
      setOpen(false);
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      handleFlowOpenChange(nextOpen);
    } else {
      handleFlowOpenChange(nextOpen);
    }
  };

  const stepNumberMap: Record<DeleteStep, number> = {
    offer: 1,
    reason: 2,
    feedback: 3,
    confirm: 4,
  };
  const stepNumber = stepNumberMap[step];

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <Label className="text-red-200">Delete account</Label>
      <p className="mt-1 text-sm text-white/60">
        This action is permanent. Before we delete your account, we&apos;ll ask
        a few quick questions.
      </p>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Delete account
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[360px] p-5">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={[
                  'h-1 rounded-full transition-all duration-300',
                  n <= stepNumber
                    ? 'w-10 bg-gradient-to-r from-[#9333EA] to-[#EC4899]'
                    : 'w-6 bg-white/10',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Step 1: Retention Offer */}
          {step === 'offer' && (
            <RetentionOfferStep
              onContinue={() => setStep('reason')}
              onOfferClick={() => {
                handleOfferClick();
                setOpen(false);
              }}
            />
          )}

          {/* Step 2: Reason Selection */}
          {step === 'reason' && (
            <ReasonSelectionStep
              onSelectReason={handleSelectReason}
              onBack={() => setStep('offer')}
            />
          )}

          {/* Step 3: Optional Feedback */}
          {step === 'feedback' && (
            <FeedbackStep
              feedback={feedback}
              onFeedbackChange={setFeedback}
              onContinue={handleFeedbackContinue}
              onBack={() => setStep('reason')}
            />
          )}

          {/* Step 4: Final Confirmation */}
          {step === 'confirm' && (
            <ConfirmationStep
              confirmText={confirmText}
              onConfirmTextChange={setConfirmText}
              isDeleting={isDeleting}
              onDelete={handleDelete}
              onBack={() => setStep('feedback')}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
