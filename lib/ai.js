import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "./config";

// The exact shape every recipe answer must follow. The API guarantees the
// response matches this schema, so the app can display it safely.
const RECIPE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["ingredients_found", "recipes"],
  properties: {
    ingredients_found: {
      type: "array",
      description: "Ingredients identified from the user's text and/or photo.",
      items: { type: "string" },
    },
    recipes: {
      type: "array",
      description: "Exactly 3 recipes.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "time_minutes", "difficulty", "servings", "ingredients_used", "missing_ingredients", "steps"],
        properties: {
          title: { type: "string" },
          description: { type: "string", description: "One appetizing sentence." },
          time_minutes: { type: "integer" },
          difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
          servings: { type: "integer" },
          ingredients_used: {
            type: "array",
            description: "Ingredients with quantities, using what the user has.",
            items: { type: "string" },
          },
          missing_ingredients: {
            type: "array",
            description: "Anything needed that the user did not list (empty if nothing). Basic pantry staples like salt, pepper, oil and water do not count as missing.",
            items: { type: "string" },
          },
          steps: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You are FridgeChef, a friendly home-cooking assistant.
The user tells you (in text and/or a photo of their fridge or pantry) what food they have.
Suggest exactly 3 recipes they can realistically cook now, favouring recipes that use what they already have and need few or no extra ingredients.
Assume they have basic pantry staples: salt, pepper, cooking oil and water.
Respect any dietary needs or preferences they mention. Write clear, numbered-style steps a beginner can follow, without numbering them yourself.
If the input contains no recognisable food, return an empty ingredients_found list and an empty recipes list.`;

export class AiError extends Error {}

export async function generateRecipes({ ingredientsText, preferences, image }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiError("The AI feature isn't configured yet (ANTHROPIC_API_KEY is missing).");
  }
  const client = new Anthropic();

  const content = [];
  if (image) {
    content.push({ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } });
  }
  let text = ingredientsText ? `Ingredients I have:\n${ingredientsText}` : "Here is a photo of my fridge or pantry.";
  if (preferences) text += `\n\nMy preferences or dietary needs: ${preferences}`;
  content.push({ type: "text", text });

  let response;
  try {
    response = await client.beta.messages.create({
      model: AI_MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: RECIPE_SCHEMA },
      },
      // If a request is ever declined by a safety filter, let the API retry it on a recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{ role: "user", content }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new AiError("The AI API key is invalid.");
    if (err instanceof Anthropic.RateLimitError) throw new AiError("The kitchen is busy right now. Please try again in a minute.");
    if (err instanceof Anthropic.BadRequestError) throw new AiError("That request couldn't be processed. Try a smaller photo or shorter list.");
    if (err instanceof Anthropic.APIError) throw new AiError("The AI service had a problem. Please try again.");
    throw err;
  }

  if (response.stop_reason === "refusal") {
    throw new AiError("Sorry, we couldn't create recipes for that request.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new AiError("The answer was cut off. Please try again with fewer ingredients.");
  }

  const json = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  return JSON.parse(json);
}
