import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.user.upsert({
    where: { email: 'admin@processmonitor.com' },
    update: {},
    create: { email: 'admin@processmonitor.com' },
  });

  console.log('✅ Seed OK');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
