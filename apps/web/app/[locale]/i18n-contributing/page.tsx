import { redirect } from "next/navigation";

export default function I18nContributingRedirectPage(props: { params: { locale: string } }) {
  redirect(`/${props.params.locale}/contributing?topic=i18n`);
}

