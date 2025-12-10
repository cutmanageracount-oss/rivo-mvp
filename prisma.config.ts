// Prisma 7 configuration file
// Il lit .env et passe DATABASE_URL à Prisma

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Ici on utilise la variable de ton .env
    url: env("DATABASE_URL"),
  },
});
