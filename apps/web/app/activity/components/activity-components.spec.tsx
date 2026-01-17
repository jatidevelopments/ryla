import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActivitySummaryCards } from './activity-summary-cards';
import { ActivityList } from './activity-list';

// Mock dependencies
vi.mock('lucide-react', () => ({
  CheckCircle2: () => <span data-testid="icon-check" />,
  XCircle: () => <span data-testid="icon-x" />,
  ArrowDown: () => <span data-testid="icon-down" />,
  ArrowUp: () => <span data-testid="icon-up" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Clock: () => <span data-testid="icon-clock" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  CreditCard: () => <span data-testid="icon-card" />,
}));

vi.mock('@ryla/ui', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      <span>
        {currentPage} of {totalPages}
      </span>
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
  cn: (...inputs: any[]) => inputs.join(' '),
}));

vi.mock('../../../components/ui/loading-state', () => ({
  LoadingState: ({ title }: any) => <div>{title}</div>,
}));

vi.mock('./activity-item', () => ({
  ActivityItem: ({ item, onClick }: any) => (
    <div data-testid={`activity-item-${item.id}`} onClick={onClick}>
      {item.type}
    </div>
  ),
}));

describe('ActivitySummaryCards', () => {
  const mockSummary = {
    generations: { completed: 10, failed: 2, processing: 0, queued: 0 },
    credits: { spent: 50, added: 100, refunded: 0 },
    totalEvents: 12,
  };

  it('should render all summary metrics', () => {
    render(<ActivitySummaryCards summary={mockSummary} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});

describe('ActivityList', () => {
  const mockItems: any[] = [
    { id: '1', type: 'generation_completed' },
    { id: '2', type: 'credits_purchased' },
  ];

  it('should render loading state', () => {
    render(
      <ActivityList
        items={[]}
        isLoading={true}
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText('Loading Activity')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(
      <ActivityList
        items={[]}
        isLoading={false}
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('should render items', () => {
    render(
      <ActivityList
        items={mockItems}
        isLoading={false}
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('activity-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('activity-item-2')).toBeInTheDocument();
  });

  it('should render pagination when multiple pages exist', () => {
    render(
      <ActivityList
        items={mockItems}
        isLoading={false}
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});
