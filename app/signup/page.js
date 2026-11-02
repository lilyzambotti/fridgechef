import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { FREE_WEEKLY_LIMIT } from "@/lib/config";

export const metadata = { title: "Create your account | FridgeChef" };

export default async function SignupPage({ searchParams }) {
  if (await getCurrentUser().catch(() => null)) redirect("/dashboard");
  const { plan } = await searchParams;
  const next = plan === "pro" ? "/dashboard?upgrade=1" : "/dashboard";
  return (
    <>
      <SiteHeader />
      <main className="auth-wrap">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="muted">Free forever plan with {FREE_WEEKLY_LIMIT} recipe searches a week.</p>
          <AuthForm mode="signup" next={next} />
        </div>
      </main>
    </>
  );
}
