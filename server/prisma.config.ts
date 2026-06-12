import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL || process.env.INTERNAL_DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  console.warn("Warning: DATABASE_URL is not set in the environment.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl || "file:./dev.db", // Fallback to dev.db only during build if URL is missing
  },
});
