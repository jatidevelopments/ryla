import { LoadingState } from '../../ui/loading-state';

export function CreatingLoading() {
  return (
    <LoadingState
      title="Creating Your Character"
      message="This may take a moment..."
      fullPage
    />
  );
}
