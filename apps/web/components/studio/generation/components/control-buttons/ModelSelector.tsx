'use client';

import * as React from 'react';
import { Tooltip } from '../../../../ui/tooltip';
import { ModelPicker } from '../../pickers/ModelPicker';
import { ModelIcon } from '../../icons';
import type { AIModel, GenerationSettings } from '../../types';

interface ModelSelectorProps {
  availableModels: AIModel[];
  selectedModel: AIModel | null;
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  showPicker: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export function ModelSelector({
  availableModels,
  selectedModel,
  settings,
  updateSetting,
  showPicker,
  onTogglePicker,
  onClosePicker,
  buttonRef,
}: ModelSelectorProps) {
  return (
    <div className="relative">
      <Tooltip content="AI Model: Choose the AI model for generation. Different models offer unique styles and quality levels.">
        <button
          ref={buttonRef}
          onClick={onTogglePicker}
          disabled={!selectedModel || availableModels.length === 0}
          className="flex items-center gap-1.5 h-8 px-2 rounded-lg bg-white/5 text-[var(--text-primary)] text-xs font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedModel && (
            <>
              <ModelIcon model={selectedModel} className="h-3.5 w-3.5 text-[var(--purple-400)]" />
              <span className="truncate max-w-[80px]">{selectedModel.name.replace('RYLA ', '')}</span>
            </>
          )}
          {!selectedModel && <span>No models available</span>}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 text-[var(--text-muted)]"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Tooltip>
      {showPicker && (
        <ModelPicker
          models={availableModels}
          selectedModelId={settings.modelId}
          onSelect={(id) => {
            updateSetting('modelId', id);
            onClosePicker();
          }}
          onClose={onClosePicker}
          anchorRef={buttonRef}
        />
      )}
    </div>
  );
}

