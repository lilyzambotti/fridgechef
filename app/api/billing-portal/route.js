import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/config";

// Opens Stripe's hosted page where Pro users can cancel or update their card.
export async function POST() {
  const user = await getCurrentUser();
  if (!user?.stripe_customer_id) return NextResponse.json({ error: "No subscription found." }, { status: 400 });
  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${siteUrl()}/dashboard`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("Billing portal failed:", err);
    return NextResponse.json({ error: "Billing management isn't available right now." }, { status: 503 });
  }
}
