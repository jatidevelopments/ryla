/**
 * Breast size options for character wizard (female only)
 * Source: MDC mdc-next-frontend/constants/breast-size-options.ts
 * MVP: 5 options (simplified from 10)
 */

import { CharacterOption } from './types';

export const BREAST_SIZE_OPTIONS: CharacterOption[] = [
  {
    id: 1,
    title: 'Small',
    value: 'small',
    imageSrc: '/images/breast-size/breast-small.webp',
  },
  {
    id: 2,
    title: 'Medium',
    value: 'medium',
    imageSrc: '/images/breast-size/breast-medium.webp',
  },
  {
    id: 3,
    title: 'Large',
    value: 'large',
    imageSrc: '/images/breast-size/breast-large.webp',
  },
  {
    id: 4,
    title: 'XL',
    value: 'xl',
    imageSrc: '/images/breast-size/breast-xl.webp',
  },
];

