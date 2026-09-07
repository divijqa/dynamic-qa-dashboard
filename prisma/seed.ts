import { PrismaClient, RunStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SUITES = ["checkout-e2e", "auth-suite", "payments-int", "search-e2e"];
const STATUSES: RunStatus[] = ["PASSED", "PASSED", "PASSED", "FLAKY", "FAILED"];

async function main() {
  for (const name of SUITES) {
    const suite = await prisma.suite.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    const runCount = 30;
    for (let i = 0; i < runCount; i++) {
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const startedAt = new Date(Date.now() - (runCount - i) * 1000 * 60 * 60 * 24);

      await prisma.testRun.create({
        data: {
          suiteId: suite.id,
          status,
          durationMs: 60_000 + Math.floor(Math.random() * 300_000),
          startedAt,
          logs:
            status === "PASSED"
              ? null
              : `Error: assertion failed in ${name} at step ${1 + Math.floor(Math.random() * 5)}`,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
