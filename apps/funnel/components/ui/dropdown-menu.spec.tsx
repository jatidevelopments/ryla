import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from './dropdown-menu';

vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="dropdown-menu-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="dropdown-menu-trigger" {...props}>{children}</button>,
  Portal: ({ children }: any) => <>{children}</>,
  Content: ({ children, ...props }: any) => <div data-testid="dropdown-menu-content" {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="dropdown-menu-item" {...props}>{children}</div>,
  Label: (props: any) => <div data-testid="dropdown-menu-label" {...props} />,
  Separator: (props: any) => <div data-testid="dropdown-menu-separator" {...props} />,
  Group: ({ children, ...props }: any) => <div data-testid="dropdown-menu-group" {...props}>{children}</div>,
}));

describe('DropdownMenu', () => {
  it('should render DropdownMenu root', () => {
    render(<DropdownMenu />);
    expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument();
  });

  it('should render DropdownMenuTrigger', () => {
    render(<DropdownMenuTrigger>Open</DropdownMenuTrigger>);
    expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should render DropdownMenuContent', () => {
    render(
      <DropdownMenuContent>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenuContent>
    );
    expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument();
  });

  it('should render DropdownMenuItem', () => {
    render(<DropdownMenuItem>Menu Item</DropdownMenuItem>);
    expect(screen.getByTestId('dropdown-menu-item')).toBeInTheDocument();
    expect(screen.getByText('Menu Item')).toBeInTheDocument();
  });

  it('should render DropdownMenuLabel', () => {
    render(<DropdownMenuLabel>Label</DropdownMenuLabel>);
    expect(screen.getByTestId('dropdown-menu-label')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('should render DropdownMenuSeparator', () => {
    render(<DropdownMenuSeparator />);
    expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument();
  });

  it('should render DropdownMenuGroup', () => {
    render(
      <DropdownMenuGroup>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenuGroup>
    );
    expect(screen.getByTestId('dropdown-menu-group')).toBeInTheDocument();
  });
});
