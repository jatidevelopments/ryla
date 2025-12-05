/**
 * Body type options for character wizard
 * Source: MDC mdc-next-frontend/constants/body-type-options.ts
 * MVP: 4 female + 4 male options (removed Pregnant)
 */

import { CharacterGender, CharacterOption } from './types';

export const BODY_TYPE_OPTIONS: CharacterOption[] = [
  // Female options
  {
    id: 1,
    title: 'Slim',
    value: 'slim',
    imageSrc: '/images/body/female/body-slim.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 2,
    title: 'Athletic',
    value: 'athletic',
    imageSrc: '/images/body/female/body-athletic.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 3,
    title: 'Curvy',
    value: 'curvy',
    imageSrc: '/images/body/female/body-curvy.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 4,
    title: 'Voluptuous',
    value: 'voluptuous',
    imageSrc: '/images/body/female/body-voluptuous.webp',
    gender: CharacterGender.Female,
  },
  // Male options
  {
    id: 5,
    title: 'Slim',
    value: 'slim',
    imageSrc: '/images/body/male/body-slim.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 6,
    title: 'Athletic',
    value: 'athletic',
    imageSrc: '/images/body/male/body-athletic.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 7,
    title: 'Muscular',
    value: 'muscular',
    imageSrc: '/images/body/male/body-muscular.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 8,
    title: 'Chubby',
    value: 'chubby',
    imageSrc: '/images/body/male/body-chubby.webp',
    gender: CharacterGender.Male,
  },
];

/** Get body types filtered by gender */
export const getBodyTypesByGender = (gender: CharacterGender): CharacterOption[] =>
  BODY_TYPE_OPTIONS.filter((opt) => opt.gender === gender);

