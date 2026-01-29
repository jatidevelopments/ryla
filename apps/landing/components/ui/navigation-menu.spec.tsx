import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from './navigation-menu';

// Mock @radix-ui/react-navigation-menu
vi.mock('@radix-ui/react-navigation-menu', () => ({
  Root: ({ children }: any) => <nav data-testid="nav-menu">{children}</nav>,
  List: ({ children }: any) => <ul data-testid="nav-list">{children}</ul>,
  Item: ({ children }: any) => <li data-testid="nav-item">{children}</li>,
  Link: ({ children, ...props }: any) => <a data-testid="nav-link" {...props}>{children}</a>,
  Viewport: () => <div data-testid="nav-viewport" />,
  Indicator: () => <div data-testid="nav-indicator" />,
  Content: ({ children }: any) => <div data-testid="nav-content">{children}</div>,
  Trigger: ({ children }: any) => <button data-testid="nav-trigger">{children}</button>,
}));

describe('NavigationMenu', () => {
  it('should render navigation menu', () => {
    render(
      <NavigationMenu>
        <NavigationMenuItem>
          <NavigationMenuLink href="/test">Link</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenu>
    );
    expect(screen.getByTestId('nav-menu')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
  });
});
