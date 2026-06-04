import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'softintern01@gmail.com';
  const updated = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });
  console.log(`Successfully verified user: ${updated.email}, role: ${updated.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
