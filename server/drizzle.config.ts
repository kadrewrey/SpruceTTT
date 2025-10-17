import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: { 
    connectionString: "postgresql://neondb_owner:npg_QbNZPt1fT7rj@ep-fancy-math-abqa20nm-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  },
} satisfies Config;