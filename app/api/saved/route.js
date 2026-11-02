import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  if (!user.is_pro) return NextResponse.json({ error: "Saving favourites is a Pro feature." }, { status: 402 });

  const { recipe } = await request.json().catch(() => ({}));
  if (!recipe?.title || !Array.isArray(recipe.steps)) {
    return NextResponse.json({ error: "Invalid recipe." }, { status: 400 });
  }
  const rows = await query(
    "INSERT INTO saved_recipes (user_id, recipe) VALUES ($1, $2) RETURNING id",
    [user.id, JSON.stringify(recipe)]
  );
  return NextResponse.json({ id: rows[0].id });
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  await query("DELETE FROM saved_recipes WHERE id = $1 AND user_id = $2", [id, user.id]);
  return NextResponse.json({ ok: true });
}
