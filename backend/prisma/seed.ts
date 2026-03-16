import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ME_HANDLE = "@me";

async function main() {
  const me = await prisma.user.upsert({
    where: { handle: ME_HANDLE },
    update: {},
    create: {
      name: "Me",
      handle: ME_HANDLE,
      balanceCents: 100_00,
    },
  });
  console.log(`Seeded actor: ${me.id} (${me.handle})`);

  const contacts = [
    { name: "Alice Johnson", handle: "@alice", balanceCents: 250_00 },
    { name: "Bob Smith", handle: "@bob", balanceCents: 50_00 },
    { name: "Carol Williams", handle: "@carol", balanceCents: 175_00 },
    { name: "Dave Brown", handle: "@dave", balanceCents: 0 },
  ];

  for (const c of contacts) {
    const user = await prisma.user.upsert({
      where: { handle: c.handle },
      update: {},
      create: c,
    });
    console.log(`Seeded contact: ${user.id} (${user.handle})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
