import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./config";

// One shared connection pool per server instance. Works with Neon (and any Postgres).
const globalForDb = globalThis;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add your Neon connection string to .env.local (or Vercel settings).");
  }
  if (!globalForDb._pgPool) {
    const url = process.env.DATABASE_URL;
    const isLocal = /localhost|127\.0\.0\.1/.test(url);
    globalForDb._pgPool = new Pool({
      connectionString: url,
      ssl: isLocal ? false : { rejectUnauthorized: true },
      max: 5,
    });
  }
  return globalForDb._pgPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS recipe_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredients TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS recipe_searches_user_time ON recipe_searches (user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS saved_recipes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// Creates the tables (if missing) and the demo account the first time the
// server talks to the database, so there is no manual setup step.
export async function setupDatabase() {
  const pool = getPool();
  await pool.query(SCHEMA);

  // The grading demo account: always exists, no email verification, full Pro access.
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, is_pro)
     VALUES ('Demo User', $1, $2, TRUE)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_pro = TRUE`,
    [DEMO_EMAIL, hash]
  );
}

export async function query(text, params) {
  if (!globalForDb._dbReady) {
    globalForDb._dbReady = setupDatabase().catch((err) => {
      globalForDb._dbReady = null; // retry on the next request
      throw err;
    });
  }
  await globalForDb._dbReady;
  const result = await getPool().query(text, params);
  return result.rows;
}

export async function closeDatabase() {
  if (globalForDb._pgPool) await globalForDb._pgPool.end();
}
