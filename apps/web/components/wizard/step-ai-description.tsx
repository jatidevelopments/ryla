'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { Textarea } from '@ryla/ui';

/**
 * Step 1 (AI Flow): AI Description
 * User describes what they want and AI generates it
 */
export function StepAIDescription() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
            <path
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 5.607a1.5 1.5 0 01-1.066 1.838l-.455.109a1.5 1.5 0 01-1.838-1.066l-.352-1.406M5 14.5l-1.402 5.607a1.5 1.5 0 001.066 1.838l.455.109a1.5 1.5 0 001.838-1.066l.352-1.406M12 21a3 3 0 100-6 3 3 0 000 6z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-white/60 text-sm font-medium mb-2">AI Creation</p>
        <h1 className="text-white text-2xl font-bold">
          Describe Your Influencer
        </h1>
      </div>

      {/* Description Input */}
      <div className="w-full">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/70 text-sm">
              Description <span className="text-pink-400">*</span>
            </p>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {(form.aiDescription || '').length}/1000
            </span>
          </div>
          <Textarea
            value={form.aiDescription || ''}
            onChange={(e) => setField('aiDescription', e.target.value)}
            placeholder="Example: A 25-year-old fitness coach from Miami with long blonde hair, blue eyes, athletic build, confident and motivational personality..."
            className="min-h-[180px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-purple-500/50 focus:ring-purple-500/20"
            maxLength={1000}
          />
          <p className="text-white/40 text-xs mt-3">
            💡 Be as detailed as possible for best results
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
            <li>• Include age, ethnicity, and physical features</li>
            <li>• Describe personality and style</li>
            <li>• Mention any specific outfit preferences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
