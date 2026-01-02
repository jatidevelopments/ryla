/**
 * Screenshot Capture Utility
 *
 * Uses html2canvas to capture page screenshots for bug reports.
 * Note: html2canvas is a browser-only library, so we use dynamic import.
 */

export interface ScreenshotOptions {
  /**
   * CSS selector to exclude from screenshot (e.g., modal)
   */
  excludeSelector?: string;
  /**
   * Quality (0-1, default 0.8)
   */
  quality?: number;
  /**
   * Scale factor (default 0.5 for smaller file size)
   */
  scale?: number;
}

/**
 * Capture screenshot of current page
 *
 * @param options Screenshot options
 * @returns Base64 data URL (PNG format)
 */
export async function captureScreenshot(
  options: ScreenshotOptions = {}
): Promise<string> {
  // Dynamic import for browser-only library
  const html2canvas = (await import('html2canvas')).default;

  const {
    excludeSelector,
    quality = 0.8,
    scale = 0.5, // Reduce size for storage efficiency
  } = options;

  try {
    // Get elements to exclude
    const excludeElements: HTMLElement[] = [];
    if (excludeSelector) {
      const elements = document.querySelectorAll<HTMLElement>(excludeSelector);
      excludeElements.push(...Array.from(elements));
    }

    // Capture screenshot
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: false,
      scale,
      logging: false,
      // Exclude elements by temporarily hiding them
      onclone: (clonedDoc) => {
        excludeElements.forEach((el) => {
          const clonedEl = clonedDoc.querySelector(
            `[data-original-id="${el.getAttribute('data-original-id') || el.id}"]`
          );
          if (clonedEl) {
            (clonedEl as HTMLElement).style.display = 'none';
          }
        });
      },
    });

    // Convert to base64 with compression
    return canvas.toDataURL('image/png', quality);
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw new Error('Failed to capture screenshot');
  }
}

/**
 * Convert base64 data URL to Blob
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Get screenshot file size in bytes
 */
export function getScreenshotSize(dataURL: string): number {
  const blob = dataURLToBlob(dataURL);
  return blob.size;
}

