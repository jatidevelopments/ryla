import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { StructuredData } from './StructuredData';

describe('StructuredData', () => {
  let createdScripts: any[] = [];
  let originalAppendChild: typeof document.head.appendChild;
  let originalCreateElement: typeof document.createElement;
  let originalGetElementById: typeof document.getElementById;

  beforeEach(() => {
    createdScripts = [];
    
    // Store original methods
    originalAppendChild = document.head.appendChild;
    originalCreateElement = document.createElement;
    originalGetElementById = document.getElementById;
    
    // Mock appendChild to track created scripts
    document.head.appendChild = vi.fn((node: any) => {
      createdScripts.push(node);
      return originalAppendChild.call(document.head, node);
    }) as any;
    
    // Mock createElement to create proper script elements
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'script') {
        const script = originalCreateElement.call(document, 'script');
        // Track the script
        createdScripts.push(script);
        return script;
      }
      return originalCreateElement.call(document, tagName);
    }) as any;
    
    // Mock getElementById to find scripts by id
    document.getElementById = vi.fn((id: string) => {
      const found = createdScripts.find((s: any) => s.id === id);
      if (found) return found;
      return originalGetElementById.call(document, id);
    }) as any;
  });

  afterEach(() => {
    // Restore original methods
    document.head.appendChild = originalAppendChild;
    document.createElement = originalCreateElement;
    document.getElementById = originalGetElementById;
    
    // Clean up created scripts
    createdScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    createdScripts = [];
    vi.clearAllMocks();
  });

  it('should not render anything', () => {
    const { container } = render(<StructuredData data={{ test: 'data' }} />);
    expect(container.firstChild).toBeNull();
  });

  it('should inject script tag with structured data', async () => {
    const testData = { '@context': 'https://schema.org', '@type': 'WebSite' };
    render(<StructuredData data={testData} />);
    
    await waitFor(() => {
      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(document.head.appendChild).toHaveBeenCalled();
      const script = createdScripts.find(s => s.type === 'application/ld+json');
      expect(script).toBeDefined();
      expect(script.textContent).toBe(JSON.stringify(testData));
    });
  });

  it('should use custom id when provided', async () => {
    render(<StructuredData data={{ test: 'data' }} id="custom-id" />);
    
    await waitFor(() => {
      const script = createdScripts[0];
      expect(script).toBeDefined();
      expect(script.id).toBe('structured-data-custom-id');
    });
  });

  it('should remove existing script with same id', async () => {
    // Create an existing script element
    const existingScript = document.createElement('script');
    existingScript.id = 'structured-data-existing-id';
    document.head.appendChild(existingScript);
    createdScripts.push(existingScript);
    
    const removeSpy = vi.spyOn(existingScript, 'remove');
    
    render(<StructuredData data={{ test: 'data' }} id="existing-id" />);
    
    await waitFor(() => {
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  it('should clean up script on unmount', async () => {
    const { unmount } = render(<StructuredData data={{ test: 'data' }} />);
    
    await waitFor(() => {
      expect(createdScripts.length).toBeGreaterThan(0);
    });
    
    const script = createdScripts[0];
    const removeSpy = vi.spyOn(script, 'remove');
    
    unmount();
    
    await waitFor(() => {
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  it('should update script when data changes', async () => {
    const { rerender } = render(<StructuredData data={{ test: 'data1' }} />);
    
    await waitFor(() => {
      expect(global.document.createElement).toHaveBeenCalled();
    });
    
    const initialCallCount = (global.document.createElement as any).mock.calls.length;
    
    rerender(<StructuredData data={{ test: 'data2' }} />);
    
    await waitFor(() => {
      // Should remove old script and create new one
      expect(global.document.createElement).toHaveBeenCalledTimes(initialCallCount + 1);
    });
  });
});
