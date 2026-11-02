# FridgeChef

**Turn what's in your fridge into dinner.** FridgeChef is a SaaS web app by **Lily Zambotti**.
Users type their ingredients or upload a photo of their fridge, and AI suggests 3 recipes they can cook right now.

## How it meets the project's finish line

| Requirement | Where it lives |
|---|---|
| 1. Homepage explaining the product and why it's worth paying for | `app/page.js` (hero, how it works, benefits, pricing, founder) |
| 2. Real sign-up and login | `app/signup`, `app/login`, `app/api/auth/*`. Passwords are hashed with bcrypt, users are stored in Neon, and sessions use a signed httpOnly cookie |
| 3. A main feature powered by AI | `app/dashboard` + `app/api/recipes` + `lib/ai.js`. Claude reads the text or photo and returns 3 structured recipes |
| 4. Stripe payments | `app/api/checkout` (Pro plan, $1/month by default), `app/api/stripe/webhook`, `app/api/billing-portal` |
| 5. Demo account | `demo@demo.com` / `password123!` is created automatically with full Pro access and no email verification (`lib/db.js`) |

**Free plan:** 3 recipe searches per week. **Pro:** unlimited searches plus saved favourite recipes.

## How the app is organised

- **Frontend** (what you see): `app/` pages, `components/`, and `app/globals.css`
- **Backend** (logic and data): `app/api/` routes and `lib/`
- **Database:** Neon Postgres. Tables are created automatically on first run.

## 1. Get your keys

You need four things. Paste each one into `.env.local` (copy `.env.example` to create it).

1. **Neon database:** sign up at neon.tech, create a project, click **Connect**, and copy the connection string into `DATABASE_URL`.
2. **Session secret:** run the command below and paste the result into `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Anthropic API key:** at console.anthropic.com go to **API Keys**, create a key, and paste it into `ANTHROPIC_API_KEY`. Add a little credit under Billing.
4. **Stripe:** at dashboard.stripe.com go to **Developers → API keys** and copy the **Secret key** into `STRIPE_SECRET_KEY`. Start with the `sk_test_...` key.

## 2. Run it on your computer

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. Your computer is the server, so the site is live only for you.

## 3. Save it to GitHub

Create a new empty repository on github.com, then from this folder:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "FridgeChef first version"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/YOUR-USERNAME/fridgechef.git
```

```bash
git push -u origin main
```

`.env.local` is in `.gitignore`, so your secret keys never go to GitHub.

## 4. Put it on the internet with Vercel

1. In vercel.com, click **Add New → Project** and import your GitHub repository. Vercel detects Next.js automatically.
2. Before deploying, open **Environment Variables** and add the same values from `.env.local`: `DATABASE_URL`, `SESSION_SECRET`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY` (and `STRIPE_WEBHOOK_SECRET` after step 5).
3. Click **Deploy**. From now on, every `git push` goes live automatically.
4. Optional: set `NEXT_PUBLIC_SITE_URL` to your live address, for example `https://fridgechef.vercel.app`.

## 5. Connect the Stripe webhook

This keeps Pro status correct when people pay or cancel.

1. In Stripe go to **Developers → Webhooks → Add endpoint**.
2. Set the endpoint URL to `https://YOUR-SITE.vercel.app/api/stripe/webhook`.
3. Select the events `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`.
4. Copy the **Signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in Vercel, then redeploy.
5. To let users cancel from the app, open **Settings → Billing → Customer portal** in Stripe and click **Save** once.

## 6. Prove it with a live $1 charge

1. Test first: in Stripe test mode, sign up for a new account on your site, click **Upgrade to Pro**, and pay with card `4242 4242 4242 4242` (any future date and any CVC).
2. Go live: activate your Stripe account, switch to **live mode**, and create a live secret key and a live webhook (steps 1 and 5 again). Put the live values in Vercel and redeploy.
3. Upgrade with your own real card. The Pro plan costs $1/month (`PRO_PRICE_CENTS=100`). Screenshot the payment in Stripe as proof. You can then cancel through **Manage subscription**.

## Demo account for grading

- Email: `demo@demo.com`
- Password: `password123!`

It is created automatically the first time the site connects to the database, already has full Pro access, and is shown on the login page. Graders can still try the Stripe checkout from the dashboard with **Try the Stripe checkout**.

## Settings you can change

| Variable | Default | What it does |
|---|---|---|
| `PRO_PRICE_CENTS` | `100` | Pro monthly price in cents |
| `FREE_WEEKLY_LIMIT` | `3` | Free recipe searches per 7 days |
| `AI_MODEL` | `claude-opus-5-5` | Claude model used for recipes |
