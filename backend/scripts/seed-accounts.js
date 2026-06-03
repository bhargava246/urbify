/**
 * Seed 4 test accounts — one per role
 * Run: node scripts/seed-accounts.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const HASH_ROUNDS = 12;
const PASSWORD = 'Test@1234';

const accounts = [
  {
    email: 'owner@urbify.test',
    role: 'OWNER',
    fullName: 'Rohan Pillai',
    city: 'Bangalore',
    profile: 'ownerProfile',
    profileData: { fullName: 'Rohan Pillai', city: 'Bangalore', state: 'Karnataka' },
  },
  {
    email: 'tenant@urbify.test',
    role: 'CLIENT',
    fullName: 'Aanya Sharma',
    city: 'Mumbai',
    profile: 'clientProfile',
    profileData: { fullName: 'Aanya Sharma', city: 'Mumbai' },
  },
  {
    email: 'broker@urbify.test',
    role: 'BROKER',
    fullName: 'Vikram Kumar',
    city: 'Delhi',
    profile: 'brokerProfile',
    profileData: { fullName: 'Vikram Kumar', city: 'Delhi', state: 'Delhi', reraId: 'DL/RERA/BRK/1234' },
  },
  {
    email: 'admin@urbify.test',
    role: 'ADMIN',
    fullName: 'Maya Ops',
    city: 'Bangalore',
    profile: null,
    profileData: null,
  },
];

async function main() {
  console.log('Seeding test accounts...\n');
  const passwordHash = await bcrypt.hash(PASSWORD, HASH_ROUNDS);

  for (const acc of accounts) {
    const existing = await prisma.user.findUnique({ where: { email: acc.email } });
    if (existing) {
      console.log(`  ⚠  ${acc.role} already exists: ${acc.email}`);
      continue;
    }

    const data = {
      email: acc.email,
      passwordHash,
      role: acc.role,
      isVerified: true,
      isActive: true,
    };

    if (acc.profile === 'ownerProfile')  data.ownerProfile  = { create: acc.profileData };
    if (acc.profile === 'clientProfile') data.clientProfile = { create: acc.profileData };
    if (acc.profile === 'brokerProfile') data.brokerProfile = { create: acc.profileData };

    await prisma.user.create({ data });
    console.log(`  ✓  ${acc.role.padEnd(7)} → ${acc.email}`);
  }

  console.log(`\nAll accounts use password: ${PASSWORD}`);
  console.log('\nTest accounts:');
  accounts.forEach(a => console.log(`  ${a.role.padEnd(7)} ${a.email}`));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
