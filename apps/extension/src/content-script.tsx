/**
 * Content script that runs on social media platforms
 *
 * Features:
 * - Detect posting interfaces
 * - Inject RYLA content suggestions
 * - Quick-post generated content
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContentInjector } from './components/content-injector';

// Only run on supported platforms
const SUPPORTED_HOSTS = ['instagram.com', 'twitter.com', 'x.com'];

function init() {
  const host = window.location.hostname.replace('www.', '');

  if (!SUPPORTED_HOSTS.some((h) => host.includes(h))) {
    return;
  }

  console.log('[RYLA Content Script] Initializing on:', host);

  // Create container for React component
  const container = document.createElement('div');
  container.id = 'ryla-content-injector';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
  `;
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ContentInjector platform={host} />
    </React.StrictMode>
  );
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
