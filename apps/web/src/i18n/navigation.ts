import { createNavigation } from "next-intl/navigation";
import { locales } from "./routing";

export const { Link, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix: "always",
});

