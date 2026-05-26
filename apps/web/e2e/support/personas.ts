import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type PersonaKey = "e2e-admin" | "e2e-member" | "e2e-viewer" | "e2e-multi-admin";

export interface Persona {
  key: PersonaKey;
  email: string;
  password: string;
  role: "brewery_admin" | "member" | "viewer";
}

export interface FixtureIdentities {
  workspaceId: string;
  // Secondary workspace seeded only as a SelectWorkspace fixture for the
  // multi-admin persona. Single-workspace personas (admin/member/viewer)
  // never see this workspace.
  secondaryWorkspaceId: string;
  recipeId: string;
  waterProfileId: string;
  brewSessionId: string;
  equipmentProfileId: string;
  vesselId: string;
  mashStepId: string;
  boilStepId: string;
}

interface PersonasFile {
  personas: Array<{
    key: PersonaKey;
    email: string;
    passwordEnv: string;
    defaultPassword: string;
    role: Persona["role"];
  }>;
  fixture: FixtureIdentities;
}

function loadPersonasFile(): PersonasFile {
  const file = path.resolve(__dirname, "..", "personas.json");
  const raw = readFileSync(file, "utf8");
  return JSON.parse(raw) as PersonasFile;
}

const data = loadPersonasFile();

export function getPersona(key: PersonaKey): Persona {
  const entry = data.personas.find((p) => p.key === key);
  if (!entry) throw new Error(`Unknown persona '${key}' in personas.json`);
  const password = (process.env[entry.passwordEnv] ?? entry.defaultPassword).trim();
  if (!password) throw new Error(`Persona '${key}' has empty password (env ${entry.passwordEnv})`);
  return {
    key: entry.key,
    email: entry.email,
    password,
    role: entry.role,
  };
}

export function getFixtureIdentities(): FixtureIdentities {
  return data.fixture;
}

export function storageStatePath(personaKey: PersonaKey): string {
  return path.resolve(__dirname, "..", ".auth", `${personaKey}.json`);
}
