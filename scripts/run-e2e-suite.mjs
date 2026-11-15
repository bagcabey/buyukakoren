#!/usr/bin/env node

import { spawnSync } from "child_process";
import process from "process";

console.log("[E2E Suite Runner] Initializing test harness...");

const result = spawnSync("npx", ["tsx", "./tests/e2e/runner.ts"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: "test",
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || "akoren-e2e-test-session-secret-key-material-32chars",
  },
});

if (result.status !== 0) {
  console.error(`\n[E2E Suite Runner] Tests failed with exit code ${result.status}`);
  process.exit(result.status || 1);
}

console.log("\n[E2E Suite Runner] All E2E test suites passed successfully!");
process.exit(0);
