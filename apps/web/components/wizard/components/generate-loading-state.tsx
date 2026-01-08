import { LoadingState } from '../../ui/loading-state';

interface GenerateLoadingStateProps {
  status: string;
}

export function GenerateLoadingState({ status }: GenerateLoadingStateProps) {
  return (
    <LoadingState
      title="Creating Your Influencer"
      message={status || 'This may take a minute...'}
      fullPage
    />
  );
}
