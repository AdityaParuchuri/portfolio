import type { D1Migration } from "@cloudflare/vitest-pool-workers";

declare global {
  interface CloudflareEnv {
    TEST_MIGRATIONS: D1Migration[];
  }
}

export {};
