import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, startSession, isValidEmail } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.length) {
    return NextResponse.json({ error: "An account with that email already exists. Try logging in." }, { status: 409 });
  }

  const rows = await query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
    [name.slice(0, 80), email, await hashPassword(password)]
  );
  await startSession(rows[0].id);
  return NextResponse.json({ ok: true });
}
