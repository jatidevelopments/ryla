'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@ryla/ui';
import { RylaButton, Label } from '@ryla/ui';
import { trpc } from '../../../lib/trpc';
import { cn } from '@ryla/ui';
import { Switch } from '@ryla/ui';
import type { TemplateConfig } from '@ryla/data/schema/templates.schema';

export interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    previewImageId: string;
    config: TemplateConfig;
    isPublic: boolean;
  }) => Promise<void>;
  defaultName?: string;
  defaultDescription?: string;
  previewImages: Array<{ id: string; url: string; thumbnailUrl?: string }>;
  config: TemplateConfig;
  influencerId?: string;
}

export function SaveTemplateDialog({
  isOpen,
  onClose,
  onSave,
  defaultName = '',
  defaultDescription = '',
  previewImages,
  config,
  influencerId,
}: SaveTemplateDialogProps) {
  const [name, setName] = React.useState(defaultName);
  const [description, setDescription] = React.useState(defaultDescription);
  const [selectedImageId, setSelectedImageId] = React.useState(
    previewImages[0]?.id || ''
  );
  const [isPublic, setIsPublic] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setDescription(defaultDescription);
      setSelectedImageId(previewImages[0]?.id || '');
      setIsPublic(false);
    }
  }, [isOpen, defaultName, defaultDescription, previewImages]);

  const handleSave = async () => {
    if (!name.trim() || !selectedImageId) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        previewImageId: selectedImageId,
        config,
        isPublic,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save this generation configuration for reuse. You can find it later in "My
            Templates".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Beach Portrait, Studio Headshot"
              className={cn(
                'w-full px-3 py-2 rounded-lg border border-[var(--border-default)]',
                'bg-[var(--bg-surface)] text-[var(--text-primary)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50',
                'text-sm'
              )}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description to help you remember this template..."
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border border-[var(--border-default)]',
                'bg-[var(--bg-surface)] text-[var(--text-primary)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50',
                'text-sm resize-none'
              )}
              maxLength={500}
            />
          </div>

          {/* Preview Image Selector */}
          {previewImages.length > 1 && (
            <div className="space-y-2">
              <Label>Preview Image</Label>
              <div className="grid grid-cols-4 gap-3">
                {previewImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageId(img.id)}
                    className={cn(
                      'relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all',
                      selectedImageId === img.id
                        ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
                        : 'border-[var(--border-default)] hover:border-[var(--border-hover)]'
                    )}
                  >
                    <Image
                      src={img.thumbnailUrl || img.url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    {selectedImageId === img.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--purple-500)]/30">
                        <div className="w-6 h-6 rounded-full bg-[var(--purple-500)] flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
            <div>
              <Label className="text-sm font-medium text-[var(--text-primary)]">
                Make Public
              </Label>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Allow other users to discover and use this template
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>

        <DialogFooter>
          <RylaButton variant="glassy-outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </RylaButton>
          <RylaButton
            variant="gradient"
            onClick={handleSave}
            disabled={!name.trim() || !selectedImageId || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </RylaButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

