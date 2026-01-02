import { Resend } from 'resend';
import * as React from 'react';
import type { ReactElement, ComponentType } from 'react';
import { renderEmail, renderEmailText } from './utils';

// ============================================================================
// Types
// ============================================================================

export interface EmailConfig {
  apiKey: string;
  from: string;
}

export interface SendEmailOptions<P = Record<string, unknown>> {
  to: string | string[];
  subject: string;
  template: ComponentType<P>;
  props: P;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailSender {
  send<P>(options: SendEmailOptions<P>): Promise<{ messageId: string }>;
}

// ============================================================================
// Default Config from Environment
// ============================================================================

function getDefaultConfig(): EmailConfig {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY environment variable is required. Please set it in your .env file.',
    );
  }

  return {
    apiKey,
    from: process.env['EMAIL_FROM'] || 'RYLA <noreply@ryla.ai>',
  };
}

// ============================================================================
// Email Sender Factory
// ============================================================================

/**
 * Create an email sender with custom configuration
 */
export function createEmailSender(config: EmailConfig): EmailSender {
  const resend = new Resend(config.apiKey);

  return {
    async send<P>(options: SendEmailOptions<P>): Promise<{ messageId: string }> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Template = options.template as any;
      const element = Template(options.props) as ReactElement;

      const [html, text] = await Promise.all([
        renderEmail(element),
        renderEmailText(element),
      ]);

      // Resend supports arrays for to, cc, bcc
      const to = Array.isArray(options.to) ? options.to : [options.to];
      const cc = options.cc
        ? Array.isArray(options.cc)
          ? options.cc
          : [options.cc]
        : undefined;
      const bcc = options.bcc
        ? Array.isArray(options.bcc)
          ? options.bcc
          : [options.bcc]
        : undefined;

      const result = await resend.emails.send({
        from: config.from,
        to,
        cc,
        bcc,
        replyTo: options.replyTo,
        subject: options.subject,
        html,
        text,
      });

      if (result.error) {
        throw new Error(
          `Failed to send email: ${result.error.message || 'Unknown error'}`,
        );
      }

      return { messageId: result.data?.id || '' };
    },
  };
}

// ============================================================================
// Default Sender (uses environment variables)
// ============================================================================

let defaultSender: EmailSender | null = null;

function getDefaultSender(): EmailSender {
  if (!defaultSender) {
    defaultSender = createEmailSender(getDefaultConfig());
  }
  return defaultSender;
}

/**
 * Send an email using the default configuration from environment variables
 *
 * @example
 * import { sendEmail, WelcomeEmail } from '@ryla/email';
 *
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome to RYLA!',
 *   template: WelcomeEmail,
 *   props: { userName: 'John' },
 * });
 */
export async function sendEmail<P>(
  options: SendEmailOptions<P>
): Promise<{ messageId: string }> {
  const sender = getDefaultSender();
  return sender.send(options);
}
