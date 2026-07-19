import { Resend } from 'resend';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { BoardShareEmail } from './templates/BoardShareEmail';
import React from 'react';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Initialize Resend client only if apiKey is present to avoid constructor crashing.
export const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Sends a welcome email to a newly registered user.
 */
export async function sendWelcomeEmail(to: string, name?: string) {
  if (!resend) {
    console.warn('[Resend Client] Cannot send welcome email: RESEND_API_KEY is not configured.');
    return null;
  }

  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Welcome to StillBoard!',
      react: React.createElement(WelcomeEmail, { name, dashboardUrl }),
    });

    if (error) {
      console.error('[Resend Client] Error sending welcome email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Resend Client] Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Sends a snapshot of a vision board to the user.
 */
export async function sendBoardShareEmail(
  to: string,
  name: string | undefined,
  boardTitle: string,
  cards: any[],
) {
  if (!resend) {
    console.warn('[Resend Client] Cannot send board email: RESEND_API_KEY is not configured.');
    return null;
  }

  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your Vision Board: ${boardTitle}`,
      react: React.createElement(BoardShareEmail, { name, boardTitle, cards, dashboardUrl }),
    });

    if (error) {
      console.error('[Resend Client] Error sending board email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Resend Client] Failed to send board email:', error);
    throw error;
  }
}
