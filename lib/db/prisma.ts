import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5
})

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
