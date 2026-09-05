import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // url: "postgresql://admin:12adminpassword12@127.0.0.1:5433/smart_task_db?schema=public",
  },
});
