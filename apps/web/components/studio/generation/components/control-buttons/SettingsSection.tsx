'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../ui/tooltip';
import { QualityPicker } from '../../pickers/QualityPicker';
import type { GenerationSettings, Quality } from '../../types';
import { QUALITY_OPTIONS } from '../../types';

interface SettingsSectionProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  showPromptEnhance: boolean;
  showQualityPicker: boolean;
  onToggleQualityPicker: () => void;
  onCloseQualityPicker: () => void;
  qualityButtonRef: React.RefObject<HTMLButtonElement>;
}

export function SettingsSection({
  settings,
  updateSetting,
  showPromptEnhance,
  showQualityPicker,
  onToggleQualityPicker,
  onCloseQualityPicker,
  qualityButtonRef,
}: SettingsSectionProps) {
  return (
    <div className="flex items-center gap-1.5" data-tutorial-target="generation-settings">
      {/* Quality */}
      <div className="relative">
        <Tooltip content="Quality: Higher resolution produces sharper images but uses more credits. 1k is fast, 2k is high-quality.">
          <button
            ref={qualityButtonRef}
            onClick={onToggleQualityPicker}
            className="flex items-center gap-1.5 h-8 px-2 rounded-lg bg-white/5 text-[var(--text-primary)] text-xs font-medium hover:bg-white/10 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-[var(--purple-400)]"
            >
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
            <span>{settings.quality}</span>
          </button>
        </Tooltip>
        {showQualityPicker && (
          <QualityPicker
            options={QUALITY_OPTIONS}
            selectedQuality={settings.quality}
            onSelect={(quality) => {
              updateSetting('quality', quality);
              onCloseQualityPicker();
            }}
            onClose={onCloseQualityPicker}
            anchorRef={qualityButtonRef}
          />
        )}
      </div>

      {/* Prompt Enhance Toggle - Only show for creating/editing modes */}
      {showPromptEnhance && (
        <>
          <Tooltip content="Prompt Enhance: Uses AI to improve your prompt, adding more detail and creativity for better generation results.">
            <button
              onClick={() => updateSetting('promptEnhance', !settings.promptEnhance)}
              className={cn(
                'flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium transition-all',
                settings.promptEnhance
                  ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)]'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
              </svg>
              <span>{settings.promptEnhance ? 'On' : 'Off'}</span>
            </button>
          </Tooltip>

          {/* Divider */}
          <div className="h-3.5 w-px bg-white/10" />
        </>
      )}

      {/* Batch Size */}
      <Tooltip content="Batch Size: Generate multiple images at once. Higher batch = more credits used per generation.">
        <div className="flex items-center gap-1 h-8 px-1 rounded-lg bg-white/5">
          <button
            onClick={() => updateSetting('batchSize', Math.max(1, settings.batchSize - 1))}
            disabled={settings.batchSize <= 1}
            className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="min-w-[32px] text-center text-xs font-medium text-[var(--text-primary)]">
            {settings.batchSize}/4
          </span>
          <button
            onClick={() => updateSetting('batchSize', Math.min(4, settings.batchSize + 1))}
            disabled={settings.batchSize >= 4}
            className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </button>
        </div>
      </Tooltip>
    </div>
  );
}

