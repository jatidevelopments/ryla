# RYLA Chrome Extension

Chrome extension for managing AI influencers and generating content directly from your browser.

## Features

- **Quick Access Popup**: Access RYLA features from any tab
- **Content Script**: Floating widget on supported social platforms (Instagram, Twitter/X)
- **Authentication**: Syncs with your RYLA account
- **Quick Actions**: Generate content, view gallery, manage characters

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Build

```bash
# Build extension
pnpm nx build extension

# Dev mode with watch
pnpm nx dev extension
```

### Load in Chrome

1. Build the extension
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `dist/apps/extension`

## Architecture

```
apps/extension/
├── src/
│   ├── background.ts      # Service worker (Manifest V3)
│   ├── popup.tsx          # Extension popup
│   ├── content-script.tsx # Injected on social platforms
│   ├── components/
│   │   ├── popup.tsx
│   │   └── content-injector.tsx
│   └── styles.css
├── public/
│   ├── manifest.json      # Extension manifest
│   └── popup.html
└── vite.config.ts
```

## Supported Platforms (Content Script)

- Instagram
- Twitter/X

## Future Features

- [ ] One-click content posting
- [ ] Caption suggestions
- [ ] Scheduled posting
- [ ] Analytics dashboard
