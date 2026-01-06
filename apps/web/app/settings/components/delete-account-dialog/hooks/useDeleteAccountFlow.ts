'use client';

import * as React from 'react';
import { capture } from '@ryla/analytics';
import type { DeleteStep, DeleteReason } from '../constants';

interface UseDeleteAccountFlowOptions {
  subscriptionTier: string;
  onDeleteConfirmed: () => Promise<void>;
}

export function useDeleteAccountFlow({
  subscriptionTier,
  onDeleteConfirmed,
}: UseDeleteAccountFlowOptions) {
  const [step, setStep] = React.useState<DeleteStep>('offer');
  const [reason, setReason] = React.useState<DeleteReason | null>(null);
  const [feedback, setFeedback] = React.useState('');
  const [confirmText, setConfirmText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const reset = React.useCallback(() => {
    setStep('offer');
    setReason(null);
    setFeedback('');
    setConfirmText('');
    setIsDeleting(false);
  }, []);

  const handleOfferClick = React.useCallback(() => {
    capture('retention_offer_clicked', { subscriptionTier });
  }, [subscriptionTier]);

  const handleSelectReason = React.useCallback(
    (r: DeleteReason) => {
      setReason(r);
      capture('account_deletion_reason_selected', { reason: r });
      setStep('feedback');
    },
    []
  );

  const handleFeedbackContinue = React.useCallback(() => {
    capture('account_deletion_feedback_submitted', {
      reason,
      has_feedback: feedback.trim().length > 0,
      subscriptionTier,
    });
    setStep('confirm');
  }, [reason, feedback, subscriptionTier]);

  const handleDelete = React.useCallback(async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await onDeleteConfirmed();
      reset();
    } catch {
      setIsDeleting(false);
    }
  }, [confirmText, onDeleteConfirmed, reset]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        capture('account_deletion_modal_opened', { subscriptionTier });
      } else {
        capture('account_deletion_cancelled', { step });
        reset();
      }
    },
    [step, subscriptionTier, reset]
  );

  return {
    step,
    setStep,
    reason,
    feedback,
    setFeedback,
    confirmText,
    setConfirmText,
    isDeleting,
    reset,
    handleOfferClick,
    handleSelectReason,
    handleFeedbackContinue,
    handleDelete,
    handleOpenChange,
  };
}

