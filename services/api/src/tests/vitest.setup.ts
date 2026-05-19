// Ensure vitest runs against the isolated test database.
// The Prisma client reads DATABASE_URL at runtime; setting it here is early enough
// for our Fastify app construction in tests.
if (process.env['DATABASE_URL_TEST']) {
  process.env['DATABASE_URL'] = process.env['DATABASE_URL_TEST'];
}

// Phase B-1: `@brewery/module-sdk`'s registerModule() uses a process-wide
// singleton registry that throws ModuleCodeAlreadyRegisteredError on the
// second buildApp() call within the same vitest worker. Clearing the
// registry here (which runs before each test file's imports) lets each
// test file safely call buildApp() at module scope.
import {
  clearModuleRegistryForTests,
  clearWebModuleRegistryForTests,
} from "@brewery/module-sdk";

clearModuleRegistryForTests();
clearWebModuleRegistryForTests();

