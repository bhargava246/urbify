/**
 * Run once after `prisma db push` to create the 2dsphere index
 * that Prisma can't create via schema (Json field limitation).
 *
 * Usage:  node scripts/create-geo-index.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$runCommandRaw({
    createIndexes: 'listings',
    indexes: [
      {
        key: { geoLocation: '2dsphere' },
        name: 'geoLocation_2dsphere',
        sparse: true, // only index docs that have geoLocation set
      },
    ],
  });
  console.log('✓ 2dsphere index created on Listing.geoLocation');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
