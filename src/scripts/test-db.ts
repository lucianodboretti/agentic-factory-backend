// scripts/test-db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const threads = await prisma.thread.findMany();
  console.log("Threads:", threads);
}

main().finally(() => prisma.$disconnect());
