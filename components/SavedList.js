"use client";

import { useState } from "react";
import RecipeCard from "./RecipeCard";

export default function SavedList({ items }) {
  const [list, setList] = useState(items);
  if (list.length === 0) {
    return <div className="panel empty">No saved recipes yet.</div>;
  }
  return (
    <div className="recipe-grid">
      {list.map(({ id, recipe }) => (
        <RecipeCard
          key={id}
          recipe={recipe}
          canSave
          savedId={id}
          onRemoved={(removedId) => setList((current) => current.filter((item) => item.id !== removedId))}
        />
      ))}
    </div>
  );
}
