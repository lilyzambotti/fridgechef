// Central place for product settings. Change these with environment variables
// (see .env.example) so you never have to touch the code.

export const APP_NAME = "FridgeChef";
export const FOUNDER_NAME = "Lily Zambotti";

// Required grading account. Created automatically with full Pro access.
export const DEMO_EMAIL = "demo@demo.com";
export const DEMO_PASSWORD = "password123!";

// Free users get this many recipe searches every 7 days. Pro is unlimited.
export const FREE_WEEKLY_LIMIT = Number(process.env.FREE_WEEKLY_LIMIT || 3);

// Pro price in cents, billed monthly. 599 = $5.99. (Set PRO_PRICE_CENTS=100 in Vercel for the $1 live test charge.)
export const PRO_PRICE_CENTS = Number(process.env.PRO_PRICE_CENTS || 599);

export function formatPrice(cents = PRO_PRICE_CENTS) {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}

// Claude model used for the recipe feature.
export const AI_MODEL = process.env.AI_MODEL || "claude-opus-5-5";

export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
