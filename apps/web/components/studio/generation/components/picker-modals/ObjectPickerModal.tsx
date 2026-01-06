'use client';

import * as React from 'react';
import { ObjectPicker } from '../../pickers/ObjectPicker';
import type { GenerationSettings, SelectedObject } from '../../types';
import type { StudioImage } from '../../../studio-image-card';

interface ObjectPickerModalProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  selectedImage: StudioImage | null;
  availableImages: StudioImage[];
  hasUploadConsent?: boolean;
  onAcceptConsent?: () => Promise<void>;
  onUploadImage?: (file: File) => Promise<StudioImage | null>;
  onClose: () => void;
}

export function ObjectPickerModal({
  settings,
  updateSetting,
  selectedImage,
  availableImages,
  hasUploadConsent = false,
  onAcceptConsent,
  onUploadImage,
  onClose,
}: ObjectPickerModalProps) {
  return (
    <ObjectPicker
      availableImages={availableImages.filter((img) => img.id !== selectedImage?.id)}
      selectedObjectIds={settings.objects.map((obj) => obj.id)}
      onObjectSelect={(image) => {
        const newObject: SelectedObject = {
          id: image.id,
          imageUrl: image.imageUrl,
          thumbnailUrl: image.thumbnailUrl,
          name: image.prompt || image.influencerName,
        };
        updateSetting('objects', [...settings.objects, newObject]);
      }}
      onObjectRemove={(imageId) => {
        updateSetting(
          'objects',
          settings.objects.filter((obj) => obj.id !== imageId)
        );
      }}
      onClose={onClose}
      maxObjects={3}
      hasUploadConsent={hasUploadConsent}
      onConsentAccept={onAcceptConsent}
      onUploadImage={onUploadImage}
    />
  );
}

