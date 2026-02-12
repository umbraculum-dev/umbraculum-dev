import { buildApp } from "./app.js";

const app = buildApp();

const port = Number(process.env.PORT ?? 4000);
const host = "0.0.0.0";

await app.listen({ port, host });

