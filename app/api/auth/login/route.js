import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { checkPassword, startSession } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const rows = await query("SELECT id, password_hash FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user || !(await checkPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  await startSession(user.id);
  return NextResponse.json({ ok: true });
}
