export type DeleteReason =
  | 'too_expensive'
  | 'missing_features'
  | 'bugs'
  | 'not_using'
  | 'privacy_concerns'
  | 'other';

export type DeleteStep = 'offer' | 'reason' | 'feedback' | 'confirm';

export const REASON_OPTIONS: { value: DeleteReason; label: string; icon: string }[] = [
  { value: 'too_expensive', label: 'Too expensive', icon: '💰' },
  { value: 'missing_features', label: 'Missing features', icon: '🔧' },
  { value: 'bugs', label: 'Technical issues', icon: '🐛' },
  { value: 'not_using', label: 'Not using enough', icon: '📉' },
  { value: 'privacy_concerns', label: 'Privacy concerns', icon: '🔒' },
  { value: 'other', label: 'Other reason', icon: '💭' },
];

