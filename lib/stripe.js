import Stripe from "stripe";
import { query } from "./db";

// Removes spaces, line breaks and quotes that often sneak in when a key is pasted.
export function stripeKey() {
  return (process.env.STRIPE_SECRET_KEY || "").replace(/\s+/g, "").replace(/^["']|["']$/g, "");
}

// A safe description of the key for error messages (never shows the secret part).
export function describeStripeKey() {
  const raw = process.env.STRIPE_SECRET_KEY || "";
  const key = stripeKey();
  const kind = key.startsWith("sk_test_") ? "sk_test_" : key.startsWith("sk_live_") ? "sk_live_" : key.startsWith("rk_") ? "rk_ (restricted)" : key.startsWith("pk_") ? "pk_ (publishable, wrong key)" : "unrecognised";
  return `key type ${kind}, ${key.length} characters${raw !== key ? ", extra spaces/quotes removed" : ""}`;
}

export function getStripe() {
  if (!stripeKey()) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  if (!globalThis._stripe) globalThis._stripe = new Stripe(stripeKey());
  return globalThis._stripe;
}

// Marks a user as Pro after a paid checkout. Safe to call more than once
// (it runs from both the webhook and the success redirect).
export async function activateProFromCheckout(session) {
  const userId = Number(session.client_reference_id);
  const paid = session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
  if (!userId || !paid) return false;

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  await query(
    `UPDATE users SET is_pro = TRUE, stripe_customer_id = $2, stripe_subscription_id = $3 WHERE id = $1`,
    [userId, customerId || null, subscriptionId || null]
  );
  return true;
}

// Keeps Pro status in sync when a subscription changes or is cancelled.
export async function syncSubscription(subscription) {
  const active = ["active", "trialing", "past_due"].includes(subscription.status);
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  await query(
    `UPDATE users SET is_pro = $2, stripe_subscription_id = $3 WHERE stripe_customer_id = $1`,
    [customerId, active, active ? subscription.id : null]
  );
}
