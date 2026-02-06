/**
 * NEL (Neural Evolution Labs) company site constants.
 */

export const COMPANY = {
  fullName: 'Neural Evolution Labs ÖÜ',
  shortName: 'NEL',
  director: 'Janis Tirtey',
  email: 'hello@neuralevolutionlabs.com',
  domain: 'https://neuralevolutionlabs.com',
} as const;

export const NAV_ANCHORS = [
  { label: 'About', href: '#about' },
  { label: 'Strengths', href: '#strengths' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Advantages', href: '#advantages' },
] as const;

/** Free-to-use stock images (Unsplash). */
export const STOCK_IMAGES = {
  hero:
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
  about:
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
  innovation:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
  data:
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  scale:
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&q=80',
  expertise:
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  contact:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
} as const;
