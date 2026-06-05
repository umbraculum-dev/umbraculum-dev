/**
 * Idempotent E2E fixture seeder (entry).
 */
import { cleanE2eFixture } from "./seedE2e/seedE2eFixtureArgs.js";
import { seedE2eFixture } from "./seedE2e/seedE2eFixtureWorkspace.js";

const args = process.argv.slice(2);
if (args.includes("--clean")) {
  void cleanE2eFixture();
} else {
  void seedE2eFixture();
}
