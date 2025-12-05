/**
 * Eye color options for character wizard
 * Source: MDC mdc-next-frontend/constants/eye-color-options.ts
 * MVP: 6 colors (Brown, Blue, Green, Hazel, Gray, Amber)
 */

import { CharacterGender, CharacterOption } from './types';

export const EYE_COLOR_OPTIONS: CharacterOption[] = [
  // Female options
  {
    id: 1,
    title: 'Brown',
    value: 'brown',
    imageSrc: '/images/eyes/female/brown-eye.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 2,
    title: 'Blue',
    value: 'blue',
    imageSrc: '/images/eyes/female/blue-eye.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 3,
    title: 'Green',
    value: 'green',
    imageSrc: '/images/eyes/female/green-eye.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 4,
    title: 'Hazel',
    value: 'hazel',
    imageSrc: '/images/eyes/female/brown-eye.webp', // Reuse brown
    gender: CharacterGender.Female,
  },
  {
    id: 5,
    title: 'Gray',
    value: 'gray',
    imageSrc: '/images/eyes/female/gray-eye.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 6,
    title: 'Amber',
    value: 'amber',
    imageSrc: '/images/eyes/female/brown-eye.webp', // Reuse brown
    gender: CharacterGender.Female,
  },
  // Male options
  {
    id: 7,
    title: 'Brown',
    value: 'brown',
    imageSrc: '/images/eyes/male/brown-eye.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 8,
    title: 'Blue',
    value: 'blue',
    imageSrc: '/images/eyes/male/blue-eye.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 9,
    title: 'Green',
    value: 'green',
    imageSrc: '/images/eyes/male/green-eye.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 10,
    title: 'Hazel',
    value: 'hazel',
    imageSrc: '/images/eyes/male/brown-eye.webp', // Reuse brown
    gender: CharacterGender.Male,
  },
  {
    id: 11,
    title: 'Gray',
    value: 'gray',
    imageSrc: '/images/eyes/male/gray-eye.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 12,
    title: 'Amber',
    value: 'amber',
    imageSrc: '/images/eyes/male/brown-eye.webp', // Reuse brown
    gender: CharacterGender.Male,
  },
];

/** Get eye colors filtered by gender */
export const getEyeColorsByGender = (gender: CharacterGender): CharacterOption[] =>
  EYE_COLOR_OPTIONS.filter((opt) => opt.gender === gender);

