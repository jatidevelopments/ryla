'use client';

import * as React from 'react';
import type { StudioImage } from '../../../../studio-image-card';

interface UseObjectUploadOptions {
  onUploadImage?: (file: File) => Promise<StudioImage | null>;
  hasUploadConsent: boolean;
  onConsentAccept?: () => Promise<void>;
  canAddMore: boolean;
  onObjectSelect: (image: StudioImage) => void;
}

export function useObjectUpload({
  onUploadImage,
  hasUploadConsent,
  onConsentAccept,
  canAddMore,
  onObjectSelect,
}: UseObjectUploadOptions) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [showConsentDialog, setShowConsentDialog] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleConsentAccept = React.useCallback(async () => {
    if (onConsentAccept) {
      await onConsentAccept();
    }
    setShowConsentDialog(false);
    // Upload pending file if exists
    if (pendingFile && onUploadImage) {
      setIsUploading(true);
      try {
        const uploadedImage = await onUploadImage(pendingFile);
        if (uploadedImage && canAddMore) {
          onObjectSelect(uploadedImage);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        setIsUploading(false);
        setPendingFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  }, [pendingFile, onUploadImage, onConsentAccept, canAddMore, onObjectSelect]);

  const handleFileInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onUploadImage) return;

      if (!hasUploadConsent) {
        setPendingFile(file);
        setShowConsentDialog(true);
        return;
      }

      // Upload directly
      setIsUploading(true);
      onUploadImage(file)
        .then((uploadedImage) => {
          if (uploadedImage && canAddMore) {
            onObjectSelect(uploadedImage);
          }
        })
        .catch((error) => {
          console.error('Failed to upload image:', error);
        })
        .finally(() => {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        });
    },
    [onUploadImage, hasUploadConsent, canAddMore, onObjectSelect]
  );

  const handleUploadClick = React.useCallback(() => {
    if (!hasUploadConsent) {
      setShowConsentDialog(true);
      return;
    }
    fileInputRef.current?.click();
  }, [hasUploadConsent]);

  const handleConsentReject = React.useCallback(() => {
    setShowConsentDialog(false);
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
    isUploading,
    showConsentDialog,
    fileInputRef,
    handleFileInputChange,
    handleUploadClick,
    handleConsentAccept,
    handleConsentReject,
  };
}

