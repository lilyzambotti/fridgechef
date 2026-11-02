import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { APP_NAME, FOUNDER_NAME, FREE_WEEKLY_LIMIT, formatPrice } from "@/lib/config";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">AI recipes from what you already have</p>
              <h1>Turn what&apos;s in your fridge into dinner.</h1>
              <p className="lead">
                Type your ingredients or snap a photo of your fridge. {APP_NAME} instantly suggests
                3 recipes you can cook right now, with step-by-step instructions and a short
                shopping list for anything missing.
              </p>
              <div className="hero-actions">
                <Link href="/signup" className="btn btn-accent">Start cooking free</Link>
                <a href="#how" className="btn btn-ghost">See how it works</a>
              </div>
              <p className="hero-note">{FREE_WEEKLY_LIMIT} free recipe searches every week. No card needed.</p>
            </div>

            <div className="demo-card" aria-label="Example of a FridgeChef result">
              <div className="demo-input">
                <strong>You:</strong> eggs, spinach, half an onion, feta, leftover rice
              </div>
              <div className="chip-row">
                <span className="chip">eggs</span>
                <span className="chip">spinach</span>
                <span className="chip">onion</span>
                <span className="chip">feta</span>
                <span className="chip">rice</span>
              </div>
              <div className="demo-recipe">
                <h3>Spinach &amp; Feta Fried Rice</h3>
                <div className="meta"><span>⏱ 20 min</span><span>👩‍🍳 Easy</span><span>🍽 Serves 2</span></div>
                <p className="muted" style={{ fontSize: "0.92rem", margin: 0 }}>
                  Crispy leftover rice tossed with wilted spinach, onion and scrambled egg, finished with salty feta.
                </p>
              </div>
              <div className="demo-recipe">
                <h3>Greek-Style Baked Eggs</h3>
                <div className="meta"><span>⏱ 25 min</span><span>👩‍🍳 Easy</span></div>
                <div className="chip-row"><span className="chip chip-warn">Need: canned tomatoes</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="section section-alt">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">How it works</p>
              <h2>From &ldquo;nothing to eat&rdquo; to dinner in three steps</h2>
            </div>
            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <h3>Show us your fridge</h3>
                <p>Type what you have, or upload a photo of your fridge or pantry. Add preferences like &ldquo;vegetarian&rdquo; or &ldquo;under 30 minutes&rdquo;.</p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h3>AI does the thinking</h3>
                <p>{APP_NAME} spots your ingredients and creates 3 recipes that use as much of what you already have as possible.</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h3>Cook and save</h3>
                <p>Follow clear, beginner-friendly steps. Save the recipes you love to cook again later.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Why it&apos;s worth it</p>
              <h2>Waste less food. Spend less. Stress less.</h2>
            </div>
            <div className="features">
              <div className="feature">
                <div className="feature-icon" aria-hidden="true">💸</div>
                <div><h3>Save money on groceries</h3><p>Cook with what you already bought instead of ordering takeout or making another store run.</p></div>
              </div>
              <div className="feature">
                <div className="feature-icon" aria-hidden="true">🌱</div>
                <div><h3>Throw away less food</h3><p>Use up that half onion and leftover rice before they go bad.</p></div>
              </div>
              <div className="feature">
                <div className="feature-icon" aria-hidden="true">📸</div>
                <div><h3>Photo or text, your choice</h3><p>Too lazy to type? Snap your fridge and let the AI identify the ingredients for you.</p></div>
              </div>
              <div className="feature">
                <div className="feature-icon" aria-hidden="true">🥗</div>
                <div><h3>Fits your diet</h3><p>Vegetarian, gluten-free, high-protein, kid-friendly. Just say so and every recipe follows it.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="section section-alt">
          <div className="container">
            <div className="section-head" style={{ textAlign: "center", marginInline: "auto" }}>
              <p className="eyebrow">Pricing</p>
              <h2>Start free. Upgrade when you&apos;re hooked.</h2>
            </div>
            <div className="pricing">
              <div className="plan">
                <h3>Free</h3>
                <div className="price">$0</div>
                <p className="muted">Try it out, no card needed.</p>
                <ul>
                  <li>{FREE_WEEKLY_LIMIT} recipe searches per week</li>
                  <li>Text or photo input</li>
                  <li>3 recipes per search</li>
                </ul>
                <Link href="/signup" className="btn btn-ghost btn-block">Create free account</Link>
              </div>
              <div className="plan plan-pro">
                <h3>Pro</h3>
                <div className="price">{formatPrice()} <small>/ month</small></div>
                <p className="muted">For people who cook at home.</p>
                <ul>
                  <li>Unlimited recipe searches</li>
                  <li>Save your favourite recipes</li>
                  <li>Text or photo input</li>
                  <li>Cancel anytime</li>
                </ul>
                <Link href="/signup?plan=pro" className="btn btn-primary btn-block">Get Pro</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="section">
          <div className="container">
            <div className="founder">
              <div className="avatar" aria-hidden="true">LZ</div>
              <div>
                <p className="eyebrow">Meet the founder</p>
                <h2>{FOUNDER_NAME}</h2>
                <p>
                  {FOUNDER_NAME} built {APP_NAME} to answer the question everyone asks at 6pm:
                  &ldquo;What can I make with what I&apos;ve got?&rdquo; The goal is simple: help people cook
                  more at home, save money and waste less food.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
