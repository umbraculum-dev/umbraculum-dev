export type { ToolResult } from "./toolsRunCommand.js";
export { runCommand } from "./toolsRunCommand.js";
export { smokeStack } from "./toolsSmoke.js";
export {
  runApiTests,
  runContractsCheck,
  runPlaywrightSmoke,
  runPlaywrightSpec,
  seedE2eFixture,
} from "./toolsDocker.js";
export { loginAs, type LoginAsResult } from "./toolsAuth.js";

import { loginAs } from "./toolsAuth.js";
import {
  runApiTests,
  runContractsCheck,
  runPlaywrightSmoke,
  runPlaywrightSpec,
  seedE2eFixture,
} from "./toolsDocker.js";
import { smokeStack } from "./toolsSmoke.js";

export const TOOLS = {
  smokeStack,
  seedE2eFixture,
  runApiTests,
  runContractsCheck,
  runPlaywrightSmoke,
  runPlaywrightSpec,
  loginAs,
} as const;

export type ToolName = keyof typeof TOOLS;
