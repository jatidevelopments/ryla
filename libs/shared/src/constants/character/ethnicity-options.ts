/**
 * Ethnicity options for character wizard
 * Source: MDC mdc-next-frontend/constants/ethnicity-options.ts
 * MVP: 7 real-world ethnicities (removed Fantasy: Elf, Angel, Demon, Alien)
 */

import { CharacterGender, CharacterOption } from './types';

export const ETHNICITY_OPTIONS: CharacterOption[] = [
  // Female options
  {
    id: 1,
    title: 'Asian',
    value: 'asian',
    imageSrc: '/images/ethnicity/female/asian-ethnicity.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 2,
    title: 'Black',
    value: 'black',
    imageSrc: '/images/ethnicity/female/black-ethnicity.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 3,
    title: 'White',
    value: 'caucasian',
    imageSrc: '/images/ethnicity/female/white-ethnicity.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 4,
    title: 'Latina',
    value: 'latina',
    imageSrc: '/images/ethnicity/female/latina-ethnicity.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 5,
    title: 'Arab',
    value: 'arabian',
    imageSrc: '/images/ethnicity/female/arab-ethnicity.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 6,
    title: 'Indian',
    value: 'indian',
    imageSrc: '/images/ethnicity/female/indian-ethnicity.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 7,
    title: 'Mixed',
    value: 'mixed',
    imageSrc: '/images/ethnicity/female/slavic-ethnicity.webp', // Reuse Slavic image
    gender: CharacterGender.Female,
  },
  // Male options
  {
    id: 8,
    title: 'Asian',
    value: 'asian',
    imageSrc: '/images/ethnicity/male/asian-ethnicity.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 9,
    title: 'Black',
    value: 'black',
    imageSrc: '/images/ethnicity/male/black-ethnicity.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 10,
    title: 'White',
    value: 'caucasian',
    imageSrc: '/images/ethnicity/male/white-ethnicity.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 11,
    title: 'Latino',
    value: 'latina',
    imageSrc: '/images/ethnicity/male/latina-ethnicity.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 12,
    title: 'Arab',
    value: 'arabian',
    imageSrc: '/images/ethnicity/male/arab-ethnicity.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 13,
    title: 'Indian',
    value: 'indian',
    imageSrc: '/images/ethnicity/male/indian-ethnicity.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 14,
    title: 'Mixed',
    value: 'mixed',
    imageSrc: '/images/ethnicity/male/slavic-ethnicity.webp', // Reuse Slavic image
    gender: CharacterGender.Male,
  },
];

/** Get ethnicities filtered by gender */
export const getEthnicitiesByGender = (gender: CharacterGender): CharacterOption[] =>
  ETHNICITY_OPTIONS.filter((opt) => opt.gender === gender);

