import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import RecipeGenerator from "@/components/RecipeGenerator";
import UpgradeButton from "@/components/UpgradeButton";
import { getCurrentUser } from "@/lib/auth";
import { getUsage } from "@/lib/usage";
import { getStripe, activateProFromCheckout } from "@/lib/stripe";
import { formatPrice } from "@/lib/config";

export const metadata = { title: "Cook | FridgeChef" };

export default async function Dashboard({ searchParams }) {
  let user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  let notice = null;

  // Returning from Stripe Checkout: confirm the payment with Stripe and unlock Pro.
  if (params.checkout_session) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(params.checkout_session);
      if (Number(session.client_reference_id) === user.id && (await activateProFromCheckout(session))) {
        notice = { type: "success", text: "Payment received. Welcome to Pro! 🎉 Unlimited recipes are unlocked." };
        user = await getCurrentUser();
      }
    } catch (err) {
      console.error("Could not confirm checkout:", err);
    }
  } else if (params.checkout === "cancelled") {
    notice = { type: "error", text: "Checkout was cancelled. You have not been charged." };
  }

  const usage = await getUsage(user);
  const firstName = user.name.split(" ")[0];
  const isDemoPro = user.is_pro && !user.stripe_subscription_id;

  return (
    <>
      <SiteHeader />
      <main className="dash">
        <div className="container">
          {notice && <div className={`alert alert-${notice.type}`} role="status">{notice.text}</div>}

          <div className="dash-head">
            <div>
              <h1>Hi {firstName}, what are we cooking?</h1>
              <p className="muted">List your ingredients or snap your fridge. We&apos;ll suggest 3 recipes.</p>
            </div>
            <div className="plan-badge">
              {user.is_pro ? <span className="badge badge-pro">Pro plan</span> : <span className="badge">Free plan</span>}
              {!user.is_pro && (
                <UpgradeButton className="btn btn-accent btn-small" autoStart={params.upgrade === "1"}>
                  Upgrade to Pro, {formatPrice()}/mo
                </UpgradeButton>
              )}
              {user.is_pro && user.stripe_subscription_id && (
                <UpgradeButton endpoint="/api/billing-portal" className="btn btn-ghost btn-small">Manage subscription</UpgradeButton>
              )}
              {isDemoPro && (
                <UpgradeButton className="btn btn-ghost btn-small">Try the Stripe checkout</UpgradeButton>
              )}
            </div>
          </div>

          <RecipeGenerator isPro={user.is_pro} initialUsage={usage} />
        </div>
      </main>
    </>
  );
}
