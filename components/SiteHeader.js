import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";

export default async function SiteHeader() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // If the database isn't configured yet, still show the public header.
  }

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden="true">🥕</span>
          {APP_NAME}
        </Link>
        <nav className="nav-links" aria-label="Main">
          {user ? (
            <>
              <Link href="/dashboard">Cook</Link>
              <Link href="/dashboard/saved">Saved</Link>
              <form action="/api/auth/logout" method="post">
                <button className="link-button" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <a href="/#how" className="nav-hide-mobile">How it works</a>
              <a href="/#pricing" className="nav-hide-mobile">Pricing</a>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="btn btn-primary btn-small">Start free</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
