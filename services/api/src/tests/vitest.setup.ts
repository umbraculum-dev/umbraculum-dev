// Ensure vitest runs against the isolated test database.
// The Prisma client reads DATABASE_URL at runtime; setting it here is early enough
// for our Fastify app construction in tests.
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

