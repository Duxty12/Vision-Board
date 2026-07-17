// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/clerk
// Receives and verifies Clerk webhook events, then dispatches to handlers.
//
// Setup required:
//  1. In Clerk Dashboard → Webhooks → add endpoint:
//       https://<your-domain>/api/webhooks/clerk
//  2. Subscribe to event: user.created
//  3. Copy the "Signing Secret" → set CLERK_WEBHOOK_SECRET in .env.local
//
// Signature verification uses svix (Clerk's webhook library).
// ─────────────────────────────────────────────────────────────────────────────

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { handleUserCreated } from '@/lib/clerk/webhook-handlers';

// ─── Svix header names ────────────────────────────────────────────────────────
const SVIX_ID        = 'svix-id';
const SVIX_TIMESTAMP = 'svix-timestamp';
const SVIX_SIGNATURE = 'svix-signature';

// ─── Clerk event types (add more as needed) ───────────────────────────────────
type ClerkWebhookEvent =
  | { type: 'user.created'; data: Parameters<typeof handleUserCreated>[0] }
  | { type: string; data: unknown };

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // ── 1. Read signing secret ─────────────────────────────────────────────────
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[Clerk webhook] CLERK_WEBHOOK_SECRET is not set.');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  // ── 2. Extract svix headers ────────────────────────────────────────────────
  const headerStore = headers();
  const svixId        = headerStore.get(SVIX_ID);
  const svixTimestamp = headerStore.get(SVIX_TIMESTAMP);
  const svixSignature = headerStore.get(SVIX_SIGNATURE);

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 },
    );
  }

  // ── 3. Read raw body ────────────────────────────────────────────────────────
  const body = await req.text();

  // ── 4. Verify signature ─────────────────────────────────────────────────────
  const wh = new Webhook(secret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      [SVIX_ID]:        svixId,
      [SVIX_TIMESTAMP]: svixTimestamp,
      [SVIX_SIGNATURE]: svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('[Clerk webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 },
    );
  }

  // ── 5. Dispatch to handler ──────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data as Parameters<typeof handleUserCreated>[0]);
        break;

      default:
        // Unhandled event types — acknowledge receipt without acting
        console.log(`[Clerk webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Clerk webhook] Handler error for "${event.type}":`, message);
    // Return 500 so Clerk retries the webhook
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
