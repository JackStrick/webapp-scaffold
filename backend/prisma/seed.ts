import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const message = await prisma.message.create({
    data: { content: "Hello World" },
  });
  console.log(`Seeded message: ${message.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
