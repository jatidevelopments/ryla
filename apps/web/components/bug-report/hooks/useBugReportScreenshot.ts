import * as React from 'react';

interface UseBugReportScreenshotReturn {
  screenshot: string | null;
  screenshotFile: File | null;
  uploadScreenshot: (file: File) => Promise<void>;
  removeScreenshot: () => void;
  error: string | null;
  setError: (error: string | null) => void;
  reset: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useBugReportScreenshot(): UseBugReportScreenshotReturn {
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const uploadScreenshot = React.useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image file must be less than 5MB');
      return;
    }

    setScreenshotFile(file);
    setError(null);

    // Convert to base64 for preview and submission
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setScreenshot(base64String);
        resolve();
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeScreenshot = React.useCallback(() => {
    setScreenshot(null);
    setScreenshotFile(null);
    setError(null);
  }, []);

  const reset = React.useCallback(() => {
    setScreenshot(null);
    setScreenshotFile(null);
    setError(null);
  }, []);

  return {
    screenshot,
    screenshotFile,
    uploadScreenshot,
    removeScreenshot,
    error,
    setError,
    reset,
  };
}

