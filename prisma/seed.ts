import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// 1. Establish the native PostgreSQL connection pool configuration parameters
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/qa_analytics_db?schema=public" 
});

// 2. Wrap the database pool instance directly inside Prisma's driver adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Initializing automated database seeding sequence...');

  // 3. Clear out historical metadata entries to avoid key constraint errors
  await prisma.metric.deleteMany({});
  await prisma.user.deleteMany({});

  // 4. Provision your core primary profile entity record
  const coreUser = await prisma.user.create({
    data: {
      email: 'divij.mothe@enterprise.qa',
      name: 'Divij Mothe',
      role: 'ADMIN',
    },
  });

  console.log(`👤 Baseline User profile mapped successfully: ${coreUser.email}`);

  // 5. Inject realistic high-utility QA metric dataset arrays
  const metricPayloads = [
    { title: 'Total Selenium Suites Executed', value: 842.0 },
    { title: 'Mean API Latency Threshold (ms)', value: 34.5 },
    { title: 'Jenkins Agent Deployment Success Rate (%)', value: 99.8 },
  ];

  for (const payload of metricPayloads) {
    const record = await prisma.metric.create({
      data: {
        title: payload.title,
        value: payload.value,
        status: 'ACTIVE',
        userId: coreUser.id,
      },
    });
    console.log(`📊 Injected data entry vector telemetry matrix: "${record.title}" -> ${record.value}`);
  }

  console.log('🏁 Database seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during database seeding execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    // 6. Safely disconnect the database socket streams
    await prisma.$disconnect();
    await pool.end();
  });
