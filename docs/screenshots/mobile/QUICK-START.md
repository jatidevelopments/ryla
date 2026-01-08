# Mobile Responsiveness - Quick Start Guide

**For continuing work or starting new components**

## 🚀 Quick Start

### To Continue Existing Work

1. **Check Status**: Read `studio/STATUS.md` (or component-specific status file)
2. **Review Progress**: Check what's done and what's remaining
3. **Continue**: Follow the "How to Continue" section in status file

### To Start New Component

1. **Follow Process**: `docs/process/MOBILE-RESPONSIVENESS-PROCESS.md`
2. **Create Folder**: `docs/screenshots/mobile/{component-name}/`
3. **Run Phases**: 1 → 2 → 3 → 4 → 5 → 6

## 📊 Current Status Summary

### Studio Page
- ✅ Filter toolbar: Fixed (44px buttons, 14px text)
- ⏳ Generation bar: Remaining (31 small touch targets, 35 small text)
- 📈 Quality: ~50/100 (Target: 90-100)
- 📁 Location: `docs/screenshots/mobile/studio/`

## 🔧 Common Fixes

### Touch Targets
```tsx
// Before
<button className="py-1.5 px-3 text-xs">Label</button>

// After
<button className="min-h-[44px] px-4 py-2.5 text-sm">Label</button>
```

### Text Size
```tsx
// Before
<span className="text-xs">Small text</span>

// After
<span className="text-sm">Readable text</span>
```

## 📋 Testing Commands

### Playwright MCP
```bash
# Set viewport
browser_resize(width: 375, height: 812)

# Navigate
browser_navigate(url: "http://localhost:3000/page")

# Screenshot
browser_take_screenshot(filename: "docs/screenshots/mobile/component/name.png")

# Automated check
browser_evaluate(function: "() => { /* check code */ }")
```

## ✅ Success Criteria

- ✅ No horizontal scrolling
- ✅ Core functionality works
- ✅ No layout breaking
- ⚠️ Touch targets ≤ 5 (Target: 0)
- ⚠️ Small text ≤ 10 (Target: 0)

## 📚 Documentation

- **Process**: `docs/process/MOBILE-RESPONSIVENESS-PROCESS.md`
- **Overview**: `docs/screenshots/mobile/README.md`
- **Component Status**: `docs/screenshots/mobile/{component}/STATUS.md`

## 🎯 Next Steps

1. Read component `STATUS.md`
2. Review remaining issues
3. Apply fixes
4. Test and validate
5. Update status

