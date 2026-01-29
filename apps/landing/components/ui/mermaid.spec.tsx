import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Mermaid } from './mermaid';

// Mock mermaid - all mocks must be defined inside factory
vi.mock('mermaid', () => {
  const mockMermaidRun = vi.fn().mockResolvedValue(undefined);
  const mockMermaidInitialize = vi.fn();
  return {
    default: {
      initialize: mockMermaidInitialize,
      run: mockMermaidRun,
    },
  };
});

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

describe('Mermaid', () => {
  it('should render component', () => {
    const { container } = render(<Mermaid chart="graph TD" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle mermaid rendering error (line 79)', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Get the mocked mermaid module and make run reject
    const mermaid = await import('mermaid');
    const mockRun = mermaid.default.run as ReturnType<typeof vi.fn>;
    mockRun.mockRejectedValueOnce(new Error('Mermaid rendering failed'));
    
    const { container } = render(<Mermaid chart="invalid chart syntax" />);
    
    // Wait for the promise to reject and error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Mermaid rendering error:',
        expect.any(Error)
      );
    }, { timeout: 1000 });
    
    // The error should be caught and logged (line 79: console.error("Mermaid rendering error:", error))
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(container.firstChild).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });
});
