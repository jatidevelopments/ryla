'use client';

import * as React from 'react';
import type { StudioMode } from '../../types';

export const MODE_CONFIG = {
  creating: {
    label: 'Create',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
      </svg>
    ),
    color: 'blue',
  },
  editing: {
    label: 'Edit',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
      </svg>
    ),
    color: 'purple',
  },
  upscaling: {
    label: 'Upscale',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M4 2a.75.75 0 01.75.75v14.5a.75.75 0 01-1.5 0V2.75A.75.75 0 014 2zm5 0a.75.75 0 01.75.75v14.5a.75.75 0 01-1.5 0V2.75A.75.75 0 019 2zm5 0a.75.75 0 01.75.75v14.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0114 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: 'green',
  },
  variations: {
    label: 'Variations',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M5.127 3.502L5.25 3.5h9.5c.041 0 .082 0 .123.002A2.251 2.251 0 0012.75 2h-5.5a2.25 2.25 0 00-2.123 1.502zM1 10.25A2.25 2.25 0 013.25 8h13.5A2.25 2.25 0 0118.75 10.5v3.25A2.25 2.25 0 0116.75 16h-13.5A2.25 2.25 0 011.25 13.75v-3.5zm11.25-6.5v-.041a2.25 2.25 0 01.041 0H15.25a.75.75 0 01.75.75v.5a.75.75 0 01-.75.75h-2.5a.75.75 0 01-.75-.75v-.459z" />
      </svg>
    ),
    color: 'orange',
  },
} as const;

export const COLOR_CLASSES = {
  blue: {
    active: 'bg-blue-500 text-white border-blue-500',
    inactive:
      'text-blue-400 border-transparent hover:border-blue-500/50 hover:bg-blue-500/10',
    border: 'border-blue-500',
  },
  purple: {
    active: 'bg-purple-500 text-white border-purple-500',
    inactive:
      'text-purple-400 border-transparent hover:border-purple-500/50 hover:bg-purple-500/10',
    border: 'border-purple-500',
  },
  green: {
    active: 'bg-green-500 text-white border-green-500',
    inactive:
      'text-green-400 border-transparent hover:border-green-500/50 hover:bg-green-500/10',
    border: 'border-green-500',
  },
  orange: {
    active: 'bg-orange-500 text-white border-orange-500',
    inactive:
      'text-orange-400 border-transparent hover:border-orange-500/50 hover:bg-orange-500/10',
    border: 'border-orange-500',
  },
} as const;
