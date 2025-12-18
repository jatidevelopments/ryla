/**
 * Background service worker for RYLA Chrome Extension (Manifest V3)
 *
 * Handles:
 * - Extension lifecycle events
 * - Message passing between popup, content scripts, and web app
 * - Authentication state management
 * - API communication with RYLA backend
 */

// Extension install/update handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[RYLA Extension] Installed:', details.reason);

  if (details.reason === 'install') {
    // First-time installation
    chrome.storage.local.set({
      installed: true,
      installedAt: new Date().toISOString(),
      version: chrome.runtime.getManifest().version,
    });

    // Open onboarding page
    chrome.tabs.create({
      url: 'https://app.ryla.ai/extension-welcome',
    });
  }

  if (details.reason === 'update') {
    console.log(
      '[RYLA Extension] Updated from',
      details.previousVersion,
      'to',
      chrome.runtime.getManifest().version
    );
  }
});

// Message handler for communication between extension components
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[RYLA Extension] Message received:', message, 'from:', sender);

  switch (message.type) {
    case 'PING':
      sendResponse({ success: true, message: 'pong' });
      break;

    case 'GET_AUTH_STATE':
      chrome.storage.local.get(['authToken', 'user'], (result) => {
        sendResponse({
          success: true,
          isAuthenticated: !!result.authToken,
          user: result.user || null,
        });
      });
      return true; // Keep channel open for async response

    case 'SET_AUTH_STATE':
      chrome.storage.local.set(
        {
          authToken: message.payload.token,
          user: message.payload.user,
        },
        () => {
          sendResponse({ success: true });
        }
      );
      return true;

    case 'CLEAR_AUTH_STATE':
      chrome.storage.local.remove(['authToken', 'user'], () => {
        sendResponse({ success: true });
      });
      return true;

    case 'OPEN_APP':
      chrome.tabs.create({
        url: message.payload?.path
          ? `https://app.ryla.ai${message.payload.path}`
          : 'https://app.ryla.ai',
      });
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true;
});

// Handle extension icon click (when no popup is set)
chrome.action.onClicked.addListener((tab) => {
  console.log('[RYLA Extension] Icon clicked for tab:', tab.id);
});

// Listen for tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Could inject additional scripts based on URL patterns
  }
});

export { };
