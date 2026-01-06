import * as React from 'react';

interface UseBugReportFormOptions {
  initialEmail?: string;
}

interface UseBugReportFormReturn {
  description: string;
  email: string;
  setDescription: (value: string) => void;
  setEmail: (value: string) => void;
  isDescriptionValid: boolean;
  canSubmit: boolean;
  reset: () => void;
}

export function useBugReportForm({
  initialEmail = '',
}: UseBugReportFormOptions = {}): UseBugReportFormReturn {
  const [description, setDescription] = React.useState('');
  const [email, setEmail] = React.useState(initialEmail);

  const isDescriptionValid = description.length >= 10;

  const reset = React.useCallback(() => {
    setDescription('');
    setEmail(initialEmail);
  }, [initialEmail]);

  return {
    description,
    email,
    setDescription,
    setEmail,
    isDescriptionValid,
    canSubmit: isDescriptionValid,
    reset,
  };
}

