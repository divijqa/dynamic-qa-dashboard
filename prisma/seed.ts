import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing automated database seeding sequence...');

  // 1. Clear out any existing historical metrics records to avoid key collisions
  await prisma.metric.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Provision a core enterprise user entity profile record
  const coreUser = await prisma.user.create({
    data: {
      email: 'divij.mothe@enterprise.qa',
      name: 'Divij Mothe',
      role: 'ADMIN',
    },
  });

  console.log(`👤 Baseline User profile mapped successfully: ${coreUser.email}`);

  // 3. Inject realistic, high-utility test metrics data vectors
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
    await prisma.$disconnect();
  });
