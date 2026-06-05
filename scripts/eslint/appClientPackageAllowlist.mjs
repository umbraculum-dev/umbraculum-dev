/**
 * Canonical allowlist of @umbraculum/* package prefixes safe to import from
 * apps/web and apps/native. Shared by solid-inventory.ts and eslint WS6.
 */
export const APP_CLIENT_PACKAGE_PREFIXES = [
  "@umbraculum/api-client",
  "@umbraculum/contracts",
  "@umbraculum/ui",
  "@umbraculum/navigation",
  "@umbraculum/i18n",
  "@umbraculum/i18n-react",
  "@umbraculum/i18n-keys",
  "@umbraculum/media",
  "@umbraculum/brewery-core",
  "@umbraculum/beerjson",
  "@umbraculum/recipes-ui",
  "@umbraculum/brewery-beerjson",
  "@umbraculum/brewery-recipes-ui",
  "@umbraculum/module-sdk",
];

export function isAllowedAppImport(specifier) {
  if (specifier.endsWith("-contracts") && specifier.startsWith("@umbraculum/")) return true;
  return APP_CLIENT_PACKAGE_PREFIXES.some((p) => specifier === p || specifier.startsWith(`${p}/`));
}
