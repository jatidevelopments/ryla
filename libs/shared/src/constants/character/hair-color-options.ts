/**
 * Hair color options for character wizard
 * Source: MDC mdc-next-frontend/constants/hair-color-options.ts
 * MVP: 7 natural colors (removed pink, purple, blue, green, orange)
 */

import { ColorOption } from './types';

export const HAIR_COLOR_OPTIONS: ColorOption[] = [
  {
    color: '#000000',
    value: 'black',
    imageSrc: '/images/hair-colors/hair-color-10.png',
  },
  {
    color: '#703A23',
    value: 'brown',
    imageSrc: '/images/hair-colors/hair-color-9.png',
  },
  {
    color: '#F8D9A8',
    value: 'blonde',
    imageSrc: '/images/hair-colors/hair-color-2.png',
  },
  {
    color: '#8B4513',
    value: 'auburn',
    imageSrc: '/images/hair-colors/hair-color-9.png', // Reuse brown
  },
  {
    color: '#FF7A00',
    value: 'red',
    imageSrc: '/images/hair-colors/hair-color-8.png',
  },
  {
    color: '#ADA7A4',
    value: 'gray',
    imageSrc: '/images/hair-colors/hair-color-3.png',
  },
  {
    color: '#FFFFFF',
    value: 'white',
    imageSrc: '/images/hair-colors/hair-color-1.png',
  },
];

