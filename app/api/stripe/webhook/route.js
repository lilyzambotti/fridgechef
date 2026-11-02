import { NextResponse } from "next/server";
import { getStripe, activateProFromCheckout, syncSubscription } from "@/lib/stripe";

// Stripe calls this URL when payments happen, so Pro status stays correct
// even if the user closes the browser before returning to the site.
export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });

  const payload = await request.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, request.headers.get("stripe-signature"), secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await activateProFromCheckout(event.data.object);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
  }
  return NextResponse.json({ received: true });
}
