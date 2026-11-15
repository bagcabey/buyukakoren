import fs from "fs";
import path from "path";
import { TestRunner } from "./test-utils";
import { runTier1Tests } from "./tier1-nominal.test";
import { runTier2Tests } from "./tier2-boundary.test";
import { runTier3Tests } from "./tier3-pairwise.test";
import { runTier4Tests } from "./tier4-scenarios.test";

if (!process.env.ADMIN_SESSION_SECRET) {
  process.env.ADMIN_SESSION_SECRET = "akoren-e2e-test-session-secret-key-material-32chars";
}

export async function runAllTests(): Promise<{ total: number; passed: number; failed: number }> {
  const storePath = path.resolve("data/store.json");
  const storeBackup = fs.existsSync(storePath) ? fs.readFileSync(storePath, "utf-8") : null;

  try {
    console.log("===============================================================");
    console.log(" Büyük Akören Köyü Derneği Web Portalı - E2E Test Suite ");
    console.log(" Tiers 1-4 Quality Gate Verification ");
    console.log("===============================================================\n");

    const runner = new TestRunner();

    console.log("\n--- [TIER 1] Nominal / Happy Path Assertion Suite ---");
    await runTier1Tests(runner);

    console.log("\n--- [TIER 2] Boundary Value Analysis & Error Assertion Suite ---");
    await runTier2Tests(runner);

    console.log("\n--- [TIER 3] Pairwise Feature Interaction Suite ---");
    await runTier3Tests(runner);

    console.log("\n--- [TIER 4] Real-World Application Workload Scenarios ---");
    await runTier4Tests(runner);

    const summary = runner.getSummary();
    console.log("\n===============================================================");
    console.log(` Test Execution Summary:`);
    console.log(` Total Tests : ${summary.total}`);
    console.log(` Passed      : ${summary.passed}`);
    console.log(` Failed      : ${summary.failed}`);
    console.log("===============================================================\n");

    if (summary.failed > 0) {
      throw new Error(`Test Suite Failed: ${summary.failed} failed assertions out of ${summary.total}.`);
    }

    return summary;
  } finally {
    // Teardown: ensure data/store.json is bit-for-bit restored to pre-test state
    if (storeBackup !== null && fs.existsSync(storePath)) {
      const current = fs.readFileSync(storePath, "utf-8");
      if (current !== storeBackup) {
        fs.writeFileSync(storePath, storeBackup, "utf-8");
      }
    }
  }
}

if (process.argv[1]?.endsWith("runner.ts") || process.argv[1]?.endsWith("runner.js")) {
  runAllTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
