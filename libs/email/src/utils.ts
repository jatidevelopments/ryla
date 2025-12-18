import { render } from '@react-email/render';
import type { ReactElement } from 'react';

/**
 * Render a React Email template to HTML
 */
export async function renderEmail(template: ReactElement): Promise<string> {
  return render(template);
}

/**
 * Render a React Email template to plain text
 */
export async function renderEmailText(template: ReactElement): Promise<string> {
  return render(template, { plainText: true });
}

/**
 * Format a date for emails
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format currency for emails
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Get app URL for email links
 */
export function getAppUrl(path = ''): string {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://app.ryla.ai';
  return `${baseUrl}${path}`;
}

/**
 * Get landing URL for email links
 */
export function getLandingUrl(path = ''): string {
  const baseUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://ryla.ai';
  return `${baseUrl}${path}`;
}
