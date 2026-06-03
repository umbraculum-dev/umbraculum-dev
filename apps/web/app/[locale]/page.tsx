import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { HomeAuthenticated } from "./HomeAuthenticated";

// Cookie name shared with services/api SESSION_COOKIE_NAME ("sid"). We do not
// validate the session server-side here (the API enforces it on every request);
// presence-only gate is enough to stop the dashboard shell from leaking to
// anonymous visitors. Expired/invalid cookies still hit the dashboard, but the
// authenticated panels (HealthPanel, AppPermissionsContent) and AuthExpiredNotice
// downgrade gracefully and redirect on 401.
const SESSION_COOKIE_NAME = "sid";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const sid = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sid?.value) {
    redirect(`/${locale}/login`);
  }

  return <HomeAuthenticated />;
}
