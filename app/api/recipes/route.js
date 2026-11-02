import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUsage } from "@/lib/usage";
import { generateRecipes, AiError } from "@/lib/ai";

export const maxDuration = 60;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BASE64 = 4_000_000; // ~3 MB image

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const ingredientsText = String(body.ingredients || "").trim().slice(0, 2000);
  const preferences = String(body.preferences || "").trim().slice(0, 300);
  let image = null;
  if (body.image?.data) {
    if (!ALLOWED_IMAGE_TYPES.includes(body.image.mediaType) || body.image.data.length > MAX_IMAGE_BASE64) {
      return NextResponse.json({ error: "Please use a JPG, PNG or WebP photo under 3 MB." }, { status: 400 });
    }
    image = { mediaType: body.image.mediaType, data: body.image.data };
  }
  if (!ingredientsText && !image) {
    return NextResponse.json({ error: "Tell us what's in your fridge, or add a photo." }, { status: 400 });
  }

  const usage = await getUsage(user);
  if (!user.is_pro && usage.remaining <= 0) {
    return NextResponse.json(
      { error: "You've used all your free recipe searches this week. Upgrade to Pro for unlimited recipes.", limitReached: true },
      { status: 402 }
    );
  }

  try {
    const result = await generateRecipes({ ingredientsText, preferences, image });
    await query(
      "INSERT INTO recipe_searches (user_id, ingredients, result) VALUES ($1, $2, $3)",
      [user.id, ingredientsText || "(photo)", JSON.stringify(result)]
    );
    return NextResponse.json({ ...result, usage: await getUsage(user) });
  } catch (err) {
    if (err instanceof AiError) return NextResponse.json({ error: err.message }, { status: 503 });
    console.error("Recipe generation failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
