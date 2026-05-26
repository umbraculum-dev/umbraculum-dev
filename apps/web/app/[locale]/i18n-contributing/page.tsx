import { redirect } from "next/navigation";

export default async function I18nContributingRedirectPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  redirect(`/${locale}/contributing?topic=i18n`);
}

