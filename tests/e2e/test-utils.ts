export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export class TestRunner {
  private currentSuite = "";
  private results: TestResult[] = [];

  async suite(name: string, fn: () => Promise<void> | void): Promise<void> {
    this.currentSuite = name;
    await fn();
  }

  async test(name: string, fn: () => void | Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await fn();
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: true,
        durationMs: Date.now() - start,
      });
      console.log(`  ✓ ${name}`);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.stack || err.message : String(err);
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: false,
        durationMs: Date.now() - start,
        error,
      });
      console.error(`  ✗ ${name}`);
      console.error(`    ${error}`);
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    return { total, passed, failed };
  }
}

export function expect<T>(actual: T) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      }
    },
    toEqual(expected: unknown) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error(`Expected ${a} to equal ${b}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
      }
    },
    toContain(expected: string | unknown) {
      if (typeof actual === "string" && typeof expected === "string") {
        if (!actual.includes(expected)) {
          throw new Error(`Expected "${actual}" to contain "${expected}"`);
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
        }
      } else {
        throw new Error(`toContain not supported on type ${typeof actual}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== "number" || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be null`);
      }
    },
    toThrow(pattern?: string | RegExp) {
      if (typeof actual !== "function") {
        throw new Error("Target is not a function");
      }
      let threw = false;
      let errorMsg = "";
      try {
        (actual as () => unknown)();
      } catch (err: unknown) {
        threw = true;
        errorMsg = err instanceof Error ? err.message : String(err);
      }
      if (!threw) {
        throw new Error("Expected function to throw, but it did not throw");
      }
      if (pattern) {
        if (typeof pattern === "string" && !errorMsg.includes(pattern)) {
          throw new Error(`Expected error message "${errorMsg}" to contain "${pattern}"`);
        } else if (pattern instanceof RegExp && !pattern.test(errorMsg)) {
          throw new Error(`Expected error message "${errorMsg}" to match ${pattern}`);
        }
      }
    },
  };
}
