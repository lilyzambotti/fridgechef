import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/config";

export const metadata = { title: "Log in | FridgeChef" };

export default async function LoginPage() {
  if (await getCurrentUser().catch(() => null)) redirect("/dashboard");
  return (
    <>
      <SiteHeader />
      <main className="auth-wrap">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="muted">Log in to turn your fridge into dinner.</p>
          <AuthForm mode="login" />
          <div className="demo-hint">
            Just looking around? Use the demo account: <strong>{DEMO_EMAIL}</strong> / <strong>{DEMO_PASSWORD}</strong>
          </div>
        </div>
      </main>
    </>
  );
}
