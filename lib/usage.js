import { query } from "./db";
import { FREE_WEEKLY_LIMIT } from "./config";

// How many recipe searches a user has done in the last 7 days.
export async function getUsage(user) {
  const rows = await query(
    `SELECT COUNT(*)::int AS used FROM recipe_searches
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
    [user.id]
  );
  const used = rows[0].used;
  return {
    used,
    limit: user.is_pro ? null : FREE_WEEKLY_LIMIT,
    remaining: user.is_pro ? null : Math.max(0, FREE_WEEKLY_LIMIT - used),
  };
}
