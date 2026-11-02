"use client";

import { useState } from "react";
import RecipeCard from "./RecipeCard";
import UpgradeButton from "./UpgradeButton";

// Shrinks a photo in the browser before upload so it stays small and fast.
function resizeImage(file, maxSize = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(img.src);
      resolve({ preview: dataUrl, mediaType: "image/jpeg", data: dataUrl.split(",")[1] });
    };
    img.onerror = () => reject(new Error("That file couldn't be read as an image."));
    img.src = URL.createObjectURL(file);
  });
}

export default function RecipeGenerator({ isPro, initialUsage }) {
  const [ingredients, setIngredients] = useState("");
  const [preferences, setPreferences] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(!isPro && initialUsage.remaining === 0);
  const [usage, setUsage] = useState(initialUsage);
  const [result, setResult] = useState(null);

  async function onPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImage(await resizeImage(file));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!ingredients.trim() && !image) {
      setError("Tell us what's in your fridge, or add a photo.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          preferences,
          image: image ? { mediaType: image.mediaType, data: image.data } : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.limitReached) setLimitReached(true);
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setResult(data);
      setUsage(data.usage);
      if (!isPro && data.usage.remaining === 0) setLimitReached(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="panel" onSubmit={onSubmit}>
        <div className="generator">
          <div>
            <label className="field">
              <span>What&apos;s in your fridge?</span>
              <textarea
                className="textarea"
                placeholder="e.g. chicken thighs, half a bag of spinach, lemon, garlic, rice, cheddar"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                maxLength={2000}
              />
            </label>
            <label className="field" style={{ marginBottom: 0 }}>
              <span>Preferences (optional)</span>
              <input
                className="input"
                placeholder="e.g. vegetarian, under 30 minutes, no dairy"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                maxLength={300}
              />
            </label>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
              Or add a photo
            </span>
            <label className="upload">
              <input type="file" accept="image/*" onChange={onPhoto} aria-label="Upload a photo of your fridge" />
              {image ? (
                <img src={image.preview} alt="Your fridge photo" />
              ) : (
                <>
                  <span style={{ fontSize: "1.8rem" }} aria-hidden="true">📸</span>
                  <span>Tap to snap or upload a photo of your fridge</span>
                </>
              )}
            </label>
            {image && (
              <button type="button" className="link-button" style={{ marginTop: 8, fontSize: "0.85rem" }} onClick={() => setImage(null)}>
                Remove photo
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error" role="alert" style={{ marginTop: 16 }}>{error}</div>}

        <div className="generator-actions">
          <p className="usage-note">
            {isPro
              ? "Pro: unlimited recipe searches."
              : `${usage.remaining} of ${usage.limit} free searches left this week.`}
          </p>
          <button className="btn btn-accent" type="submit" disabled={loading || limitReached}>
            {loading ? <><span className="spinner" aria-hidden="true" /> Cooking up ideas…</> : "Get 3 recipes"}
          </button>
        </div>

        {!isPro && limitReached && (
          <div className="upgrade-banner">
            <p><strong>You&apos;ve used your free searches this week.</strong> Go Pro for unlimited recipes.</p>
            <UpgradeButton>Upgrade to Pro</UpgradeButton>
          </div>
        )}
      </form>

      {result && (
        <section className="results" aria-live="polite">
          {result.recipes.length === 0 ? (
            <div className="panel empty">We couldn&apos;t spot any food there. Try listing your ingredients or a clearer photo.</div>
          ) : (
            <>
              {result.ingredients_found.length > 0 && (
                <div className="found">
                  <h3 style={{ marginBottom: 10 }}>Ingredients we found</h3>
                  <div className="chip-row">
                    {result.ingredients_found.map((item) => <span key={item} className="chip">{item}</span>)}
                  </div>
                </div>
              )}
              <div className="recipe-grid">
                {result.recipes.map((recipe, i) => <RecipeCard key={`${recipe.title}-${i}`} recipe={recipe} canSave={isPro} />)}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
