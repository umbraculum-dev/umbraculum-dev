# Native apps

| App | Installation profile | Workspace | Purpose |
|-----|---------------------|-----------|---------|
| **starter** | Core (default) | `@umbraculum/native-starter` | Minimal one-screen Expo app — no vertical packages |
| **brewery** | Reference (opt-in) | `@umbraculum/native-brewery` | Full brewery reference vertical native experience |

The active native app is selected by the [installation profile manifest](../../.umbraculum/install.core.json) (`nativeApps` field). See [docs/design/installation-profile.md](../../docs/design/installation-profile.md).

**Core profile (default):**

```bash
cd apps/native/starter && npx expo start
```

**Reference profile (brewery):**

```bash
UMBRACULUM_MODULE_PROFILE=reference docker compose -f docker-compose.yml -f docker-compose.reference.yml up -d
cd apps/native/brewery && npx expo start
```

CI `native-deps` runs `expo-doctor` against the manifest's primary native app (`starter` or `brewery`).
