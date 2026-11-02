"use client";

import { useState } from "react";

export default function RecipeCard({ recipe, canSave, savedId: initialSavedId = null, onRemoved }) {
  const [savedId, setSavedId] = useState(initialSavedId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setSavedId(data.id);
    else setError(data.error || "Couldn't save.");
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/saved?id=${savedId}`, { method: "DELETE" });
    setBusy(false);
    if (onRemoved) onRemoved(savedId);
    else setSavedId(null);
  }

  return (
    <article className="recipe">
      <h3>{recipe.title}</h3>
      <div className="meta">
        <span>⏱ {recipe.time_minutes} min</span>
        <span>👩‍🍳 {recipe.difficulty}</span>
        <span>🍽 Serves {recipe.servings}</span>
      </div>
      <p className="muted" style={{ fontSize: "0.94rem", margin: 0 }}>{recipe.description}</p>

      {recipe.missing_ingredients?.length > 0 && (
        <>
          <h4>You&apos;ll also need</h4>
          <div className="chip-row">
            {recipe.missing_ingredients.map((item) => <span key={item} className="chip chip-warn">{item}</span>)}
          </div>
        </>
      )}

      <h4>Ingredients</h4>
      <ul>{recipe.ingredients_used.map((item, i) => <li key={i}>{item}</li>)}</ul>

      <h4>Steps</h4>
      <ol>{recipe.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>

      <div className="recipe-actions">
        {savedId ? (
          <button className="btn btn-ghost btn-small" onClick={remove} disabled={busy}>★ Saved · Remove</button>
        ) : canSave ? (
          <button className="btn btn-primary btn-small" onClick={save} disabled={busy}>☆ Save recipe</button>
        ) : (
          <span className="usage-note">Upgrade to Pro to save recipes.</span>
        )}
        {error && <p className="usage-note" style={{ color: "#9b3520", marginTop: 6 }}>{error}</p>}
      </div>
    </article>
  );
}
