'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { Textarea } from '@ryla/ui';

/**
 * Step 1 (Prompt-based Flow): Prompt Input
 * User describes their character in natural language
 */
export function StepPromptInput() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
            <path
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-white/60 text-sm font-medium mb-2">Prompt Creation</p>
        <h1 className="text-white text-2xl font-bold">
          Describe Your Character
        </h1>
      </div>

      {/* Prompt Input */}
      <div className="w-full mb-4">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/70 text-sm">
              Character Description <span className="text-pink-400">*</span>
            </p>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {(form.promptInput || '').length}/1000
            </span>
          </div>
          <Textarea
            value={form.promptInput || ''}
            onChange={(e) => setField('promptInput', e.target.value)}
            placeholder="Example: A 25-year-old fitness coach from Miami with long blonde hair, blue eyes, athletic build, confident and motivational personality. She loves yoga, healthy eating, and inspiring others to live their best life..."
            className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-cyan-500/50 focus:ring-cyan-500/20"
            maxLength={1000}
          />
          <p className="text-white/40 text-xs mt-3">
            💡 Be as detailed as possible. Include age, appearance, personality, and style preferences.
          </p>
        </div>
      </div>

      {/* Voice Memo Placeholder */}
      <div className="w-full">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white/60">
                <path
                  d="M19 10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v1z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6v4M12 14v4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-white/70 text-sm">
                Voice Memo <span className="text-white/40">(Coming Soon)</span>
              </p>
            </div>
          </div>
          <button
            disabled
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Record Voice Description
          </button>
          <p className="text-white/30 text-xs mt-2 text-center">
            Voice memo transcription will be available soon
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="w-full mt-5">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
          <p className="text-white/80 text-sm font-medium mb-2">
            Tips for great results:
          </p>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• Include age, ethnicity, and physical features (hair, eyes, body type)</li>
            <li>• Describe personality traits and style preferences</li>
            <li>• Mention any specific outfit or aesthetic preferences</li>
            <li>• The more details you provide, the better the AI can create your character</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

