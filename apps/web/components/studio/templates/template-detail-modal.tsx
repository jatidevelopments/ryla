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
import { RylaButton } from '@ryla/ui';
import { trpc } from '../../../lib/trpc';
import { cn } from '@ryla/ui';
import { Sparkles, TrendingUp, Users, Calendar } from 'lucide-react';
import type { Template } from '@ryla/data/schema/templates.schema';

export interface TemplateDetailModalProps {
  templateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (templateId: string) => void;
}

export function TemplateDetailModal({
  templateId,
  isOpen,
  onClose,
  onApply,
}: TemplateDetailModalProps) {
  const { data, isLoading } = trpc.templates.getById.useQuery(
    { id: templateId! },
    { enabled: !!templateId && isOpen }
  );

  const template = data?.template;

  const handleApply = () => {
    if (templateId) {
      onApply(templateId);
      onClose();
    }
  };

  if (!template && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--purple-500)]" />
          </div>
        ) : template ? (
          <>
            <DialogHeader>
              <DialogTitle>{template.name}</DialogTitle>
              {template.description && (
                <DialogDescription>{template.description}</DialogDescription>
              )}
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Preview Image */}
              <div className="space-y-4">
                <div className="relative aspect-[9/16] rounded-lg overflow-hidden border border-[var(--border-default)] bg-[var(--bg-subtle)]">
                  <Image
                    src={template.previewImageUrl}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {template.usageCount > 0 && (
                    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-1">
                        <Users className="h-4 w-4" />
                        <span>Used</span>
                      </div>
                      <div className="text-lg font-semibold text-[var(--text-primary)]">
                        {template.usageCount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {template.successRate !== null && (
                    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Success Rate</span>
                      </div>
                      <div className="text-lg font-semibold text-[var(--text-primary)]">
                        {Number(template.successRate).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Config Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Configuration
                </h3>
                <div className="space-y-3">
                  <ConfigItem label="Scene" value={template.config.scene || 'Not set'} />
                  <ConfigItem
                    label="Environment"
                    value={template.config.environment || 'Not set'}
                  />
                  <ConfigItem
                    label="Outfit"
                    value={
                      typeof template.config.outfit === 'string'
                        ? template.config.outfit
                        : template.config.outfit
                        ? 'Custom Composition'
                        : 'Not set'
                    }
                  />
                  {template.config.poseId && (
                    <ConfigItem label="Pose" value={template.config.poseId} />
                  )}
                  {template.config.styleId && (
                    <ConfigItem label="Style" value={template.config.styleId} />
                  )}
                  {template.config.lightingId && (
                    <ConfigItem label="Lighting" value={template.config.lightingId} />
                  )}
                  {template.config.modelId && (
                    <ConfigItem label="Model" value={template.config.modelId} />
                  )}
                  {template.config.objects && template.config.objects.length > 0 && (
                    <ConfigItem
                      label="Objects"
                      value={`${template.config.objects.length} object(s)`}
                    />
                  )}
                  <ConfigItem label="Aspect Ratio" value={template.config.aspectRatio} />
                  <ConfigItem
                    label="Quality"
                    value={template.config.qualityMode.toUpperCase()}
                  />
                  <ConfigItem
                    label="NSFW"
                    value={template.config.nsfw ? 'Yes' : 'No'}
                  />
                  {template.config.prompt && (
                    <ConfigItem label="Prompt" value={template.config.prompt} />
                  )}
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-default)]">
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-xs bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-3 border-t border-[var(--border-default)] text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <RylaButton variant="glassy-outline" onClick={onClose}>
                Close
              </RylaButton>
              <RylaButton variant="gradient" onClick={handleApply}>
                <Sparkles className="h-4 w-4 mr-2" />
                Use This Template
              </RylaButton>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)]/50">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

