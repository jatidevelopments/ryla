/**
 * Hair style options for character wizard
 * Source: MDC mdc-next-frontend/constants/hair-style-options.ts
 * MVP: 7 female + 7 male styles
 */

import { CharacterGender, CharacterOption } from './types';

export const HAIR_STYLE_OPTIONS: CharacterOption[] = [
  // Female options
  {
    id: 1,
    title: 'Long',
    value: 'long',
    imageSrc: '/images/haircut/female/long-hair.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 2,
    title: 'Short',
    value: 'short',
    imageSrc: '/images/haircut/female/short-hair.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 3,
    title: 'Braids',
    value: 'braids',
    imageSrc: '/images/haircut/female/braids-hair.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 4,
    title: 'Ponytail',
    value: 'ponytail',
    imageSrc: '/images/haircut/female/ponytail-hair.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 5,
    title: 'Bangs',
    value: 'bangs',
    imageSrc: '/images/haircut/female/bangs-hair.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 6,
    title: 'Bun',
    value: 'bun',
    imageSrc: '/images/haircut/female/bun-hair.webp',
    gender: CharacterGender.Female,
  },
  {
    id: 7,
    title: 'Wavy',
    value: 'wavy',
    imageSrc: '/images/haircut/female/wavy-hair.webp',
    gender: CharacterGender.Female,
  },
  // Male options
  {
    id: 8,
    title: 'Short',
    value: 'short',
    imageSrc: '/images/haircut/male/short-hair.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 9,
    title: 'Long',
    value: 'long',
    imageSrc: '/images/haircut/male/long-hair.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 10,
    title: 'Crew Cut',
    value: 'crew-cut',
    imageSrc: '/images/haircut/male/crew-cut-hair.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 11,
    title: 'Wavy',
    value: 'wavy',
    imageSrc: '/images/haircut/male/wavy-hair.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 12,
    title: 'Pompadour',
    value: 'pompadour',
    imageSrc: '/images/haircut/male/pompadour-hair.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 13,
    title: 'Layered',
    value: 'layered-cut',
    imageSrc: '/images/haircut/male/layered-cut-hair.webp',
    gender: CharacterGender.Male,
  },
  {
    id: 14,
    title: 'Bald',
    value: 'bald',
    imageSrc: '/images/haircut/male/bald-hair.webp',
    gender: CharacterGender.Male,
  },
];

/** Get hair styles filtered by gender */
export const getHairStylesByGender = (gender: CharacterGender): CharacterOption[] =>
  HAIR_STYLE_OPTIONS.filter((opt) => opt.gender === gender);

