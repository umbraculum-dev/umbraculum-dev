"use client";

import type { ReactNode } from "react";

import type { WebShellNoticeConfig, WebShellNoticeVariant } from "@umbraculum/module-sdk";
import { useTranslations } from "next-intl";

import { SizableText } from "tamagui";

import { MessageBox, type MessageBoxVariant } from "./MessageBox";

const DEMO_FIXTURE_WORKSPACE_ID = "e2e00000-0000-0000-0000-0000000000aa";

const DOC_URLS = {
  gettingStarted: "https://docs.umbraculum.dev/GETTING-STARTED",
  buildingVertical: "https://docs.umbraculum.dev/BUILDING-YOUR-VERTICAL",
  glossary: "https://docs.umbraculum.dev/GLOSSARY",
  forum: "https://forum.umbraculum.dev",
  nativeCi: "https://docs.umbraculum.dev/NATIVE-STRATEGY-AND-CI",
  demoRunbook: "https://docs.umbraculum.dev/design/demo-host-runbook",
  nativeSmoke: "https://docs.umbraculum.dev/design/canonical-native-platform-surface",
} as const;

function toMessageBoxVariant(variant: WebShellNoticeVariant): MessageBoxVariant {
  if (variant === "warning") return "warning";
  return "notice";
}

function externalLink(href: string, children: ReactNode) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="brew-shell-notice__link">
      {children}
    </a>
  );
}

type CredentialRow = {
  role: string;
  email: string;
  password: string;
};

function CredentialsTable({
  columns,
  rows,
  footnote,
}: {
  columns: { role: string; email: string; password: string };
  rows: CredentialRow[];
  footnote: string;
}) {
  return (
    <div className="brew-shell-notice__credentials">
      <table className="brew-shell-notice__table">
        <thead>
          <tr>
            <th scope="col">{columns.role}</th>
            <th scope="col">{columns.email}</th>
            <th scope="col">{columns.password}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.email}>
              <td>{row.role}</td>
              <td>
                <code>{row.email}</code>
              </td>
              <td>
                <code>{row.password}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SizableText size="$2" color="var(--text)" style={{ opacity: 0.9, marginTop: 6 }}>
        {footnote}
      </SizableText>
    </div>
  );
}

function DemoShellNoticeBody() {
  const t = useTranslations("shellNotice.demo");

  const credentialRows: CredentialRow[] = [
    {
      role: t("roleAdmin"),
      email: t("emailAdmin"),
      password: t("passwordAdmin"),
    },
    {
      role: t("roleMember"),
      email: t("emailMember"),
      password: t("passwordMember"),
    },
    {
      role: t("roleViewer"),
      email: t("emailViewer"),
      password: t("passwordViewer"),
    },
    {
      role: t("roleMultiAdmin"),
      email: t("emailMultiAdmin"),
      password: t("passwordMultiAdmin"),
    },
  ];

  return (
    <div className="brew-shell-notice__body">
      <SizableText size="$2" fontWeight="650" color="var(--text)">
        {t("summaryLine")}
      </SizableText>

      <details className="brew-shell-notice__details">
        <summary className="brew-shell-notice__summary">{t("credentialsHeading")}</summary>
        <div className="brew-shell-notice__expander-body">
          <CredentialsTable
            columns={{
              role: t("columnRole"),
              email: t("columnEmail"),
              password: t("columnPassword"),
            }}
            rows={credentialRows}
            footnote={t("fixtureWorkspace", { workspaceId: DEMO_FIXTURE_WORKSPACE_ID })}
          />
        </div>
      </details>

      <details className="brew-shell-notice__details">
        <summary className="brew-shell-notice__summary">{t("expanderLabel")}</summary>
        <div className="brew-shell-notice__expander-body">
          <SizableText size="$2" color="var(--text)">
            {t("dataLossWarning")}
          </SizableText>
          <SizableText size="$2" color="var(--text)">
            {t("platformIntro")}
          </SizableText>
          <SizableText size="$2" color="var(--text)">
            {t("referenceVertical")}
          </SizableText>

          <ul className="brew-shell-notice__list">
            <li>
              {externalLink(
                DOC_URLS.gettingStarted,
                <strong>{t("linkGettingStarted")}</strong>,
              )}{" "}
              — {t("linkGettingStartedDesc")}
            </li>
            <li>
              {externalLink(
                DOC_URLS.buildingVertical,
                <strong>{t("linkBuildingVertical")}</strong>,
              )}{" "}
              — {t("linkBuildingVerticalDesc")}
            </li>
            <li>
              {externalLink(DOC_URLS.glossary, <strong>{t("linkGlossary")}</strong>)} —{" "}
              {t("linkGlossaryDesc")}
            </li>
          </ul>

          <SizableText size="$2" color="var(--text)">
            {t("unsurePrefix")}
            {externalLink(DOC_URLS.forum, t("unsureForumLink"))}
            {t("unsureSuffix")}
          </SizableText>

          <SizableText size="$2" color="var(--text)">
            {t("nativeIntro")}
          </SizableText>
          <ul className="brew-shell-notice__list">
            <li>
              {t("nativeBulletOperators")}{" "}
              {externalLink(DOC_URLS.nativeCi, t("nativeLinkNativeCi"))}
              {" · "}
              {externalLink(DOC_URLS.demoRunbook, t("nativeLinkDemoRunbook"))}
            </li>
            <li>
              {t("nativeBulletSmokeLabel")}{" "}
              {externalLink(DOC_URLS.nativeSmoke, t("nativeLinkSmoke"))}
            </li>
            <li>{t("nativeBulletApk")}</li>
          </ul>
        </div>
      </details>
    </div>
  );
}

export function WebShellNotice({ config }: { config: WebShellNoticeConfig | null }) {
  const t = useTranslations("shellNotice.demo");

  if (!config || config.id !== "demo") return null;

  return (
    <section className="brew-shell-notice" aria-label={t("ariaLabel")}>
      <MessageBox variant={toMessageBoxVariant(config.variant)} role="status">
        <DemoShellNoticeBody />
      </MessageBox>
    </section>
  );
}
