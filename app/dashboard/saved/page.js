import { redirect } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SavedList from "@/components/SavedList";
import UpgradeButton from "@/components/UpgradeButton";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata = { title: "Saved recipes | FridgeChef" };

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const saved = user.is_pro
    ? await query("SELECT id, recipe FROM saved_recipes WHERE user_id = $1 ORDER BY created_at DESC", [user.id])
    : [];

  return (
    <>
      <SiteHeader />
      <main className="dash">
        <div className="container">
          <div className="dash-head">
            <div>
              <h1>Saved recipes</h1>
              <p className="muted">Your favourites, ready to cook again.</p>
            </div>
          </div>

          {!user.is_pro ? (
            <div className="panel empty">
              <p>Saving favourite recipes is a Pro feature.</p>
              <UpgradeButton>Upgrade to Pro</UpgradeButton>
            </div>
          ) : saved.length === 0 ? (
            <div className="panel empty">
              <p>No saved recipes yet.</p>
              <Link href="/dashboard" className="btn btn-primary">Find something to cook</Link>
            </div>
          ) : (
            <SavedList items={saved} />
          )}
        </div>
      </main>
    </>
  );
}
