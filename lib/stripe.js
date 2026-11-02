import Stripe from "stripe";
import { query } from "./db";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  if (!globalThis._stripe) globalThis._stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
