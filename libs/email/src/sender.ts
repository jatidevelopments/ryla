import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { ReactElement, ComponentType } from 'react';
import { renderEmail, renderEmailText } from './utils';

// ============================================================================
// Types
// ============================================================================

export interface EmailConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
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
  return {
    host: process.env['EMAIL_SERVER_HOST'] || 'smtp.gmail.com',
    port: Number(process.env['EMAIL_SERVER_PORT']) || 465,
    secure: true,
    auth: {
      user: process.env['EMAIL_SERVER_USER'] || '',
      pass: process.env['EMAIL_SERVER_PASSWORD'] || '',
    },
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
  const transporter: Transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure ?? config.port === 465,
    auth: config.auth,
  });

  return {
    async send<P>(options: SendEmailOptions<P>): Promise<{ messageId: string }> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Template = options.template as any;
      const element = Template(options.props) as ReactElement;

      const [html, text] = await Promise.all([
        renderEmail(element),
        renderEmailText(element),
      ]);

      const result = await transporter.sendMail({
        from: config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc
          ? Array.isArray(options.cc)
            ? options.cc.join(', ')
            : options.cc
          : undefined,
        bcc: options.bcc
          ? Array.isArray(options.bcc)
            ? options.bcc.join(', ')
            : options.bcc
          : undefined,
        replyTo: options.replyTo,
        subject: options.subject,
        html,
        text,
      });

      return { messageId: result.messageId };
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
