import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

// Mock @radix-ui/react-tabs
vi.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="tabs-root" {...props}>{children}</div>,
  List: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="tabs-trigger" {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="tabs-content" {...props}>{children}</div>,
}));

describe('Tabs', () => {
  it('should render tabs', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
  });

  it('should render tabs list and triggers', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('tabs-trigger')).toHaveLength(2);
  });

  it('should render tabs content', () => {
    render(
      <Tabs>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('tabs-content')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });
});
