import { useLocale } from "next-intl";

import type { SupportedLocale } from "@umbraculum/i18n/locales";
import { routeToPath, getRouteAvailability } from "@umbraculum/navigation";
import type { AppPlatform, AppRouter, RouteRef } from "@umbraculum/navigation";

import { useRouter } from "../i18n/navigation";

export function useAppRouter(): AppRouter {
  const router = useRouter();
  const locale = useLocale() as SupportedLocale;

  const toHref = (ref: RouteRef) => `/${locale}${routeToPath(ref)}`;

  return {
    push: (ref) => router.push(toHref(ref)),
    replace: (ref) => router.replace(toHref(ref)),
    back: () => router.back(),
    isAvailable: (ref, platform: AppPlatform) => getRouteAvailability(ref.id, platform) === "available",
    href: (ref) => toHref(ref),
  };
}

