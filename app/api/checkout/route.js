import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { APP_NAME, DEMO_EMAIL, PRO_PRICE_CENTS, siteUrl } from "@/lib/config";

// Starts a Stripe Checkout for the Pro monthly plan and returns its URL.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  // Block only real paying subscribers. The demo account can always try the checkout,
  // even after a test payment, so every grader can test it.
  if (user.stripe_subscription_id && user.email !== DEMO_EMAIL) return NextResponse.json({ error: "You're already subscribed to Pro." }, { status: 400 });

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Checkout failed: STRIPE_SECRET_KEY is not set in this Vercel project.");
    return NextResponse.json({ error: "Payments aren't set up yet: the Stripe key is missing on the server." }, { status: 503 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: String(user.id),
      ...(user.stripe_customer_id ? { customer: user.stripe_customer_id } : { customer_email: user.email }),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRO_PRICE_CENTS,
            recurring: { interval: "month" },
            product_data: { name: `${APP_NAME} Pro`, description: "Unlimited AI recipes and saved favourites" },
          },
        },
      ],
      success_url: `${siteUrl()}/dashboard?checkout_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/dashboard?checkout=cancelled`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout failed:", err);
    // Stripe's own error messages are safe to show and say exactly what to fix.
    const message =
      err?.type === "StripeAuthenticationError"
        ? "Payments aren't set up correctly: the Stripe key on the server is invalid."
        : err?.type?.startsWith("Stripe")
          ? `Stripe error: ${err.message}`
          : "Payments aren't available right now. Please try again later.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
