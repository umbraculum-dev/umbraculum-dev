"use client";

import { SizableText, View } from "tamagui";

import type { ByUserRow } from "./aiUsageTypes";
import { formatNumber, formatPercent } from "./aiUsageFormatters";

export function AiUsageTable({
  rows,
  perUserDailyCap,
  roleLimits,
  labels,
}: {
  rows: ByUserRow[];
  perUserDailyCap: number;
  roleLimits: Record<string, number>;
  labels: {
    user: string;
    role: string;
    today: string;
    month: string;
    roleLimit: string;
    rolePercent: string;
  };
}) {
  return (
    <View>
      {/*
       * Plain table here because Tamagui doesn't ship a Table primitive and
       * the dashboard is web-only for v0 (native dashboard is deferred).
       */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
        <thead>
          <tr>
            <th style={cellHeaderStyle}>{labels.user}</th>
            <th style={cellHeaderStyle}>{labels.role}</th>
            <th style={cellHeaderStyle}>{labels.today}</th>
            <th style={cellHeaderStyle}>{labels.month}</th>
            <th style={cellHeaderStyle}>{labels.roleLimit}</th>
            <th style={cellHeaderStyle}>{labels.rolePercent}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const today = r.tokensInToday + r.tokensOutToday;
            const month = r.tokensInMonth + r.tokensOutMonth;
            const limit = r.role ? roleLimits[r.role] ?? 0 : 0;
            const percent = limit > 0 ? Math.min(month / limit, 1) : 0;
            const todayPercent =
              perUserDailyCap > 0 ? Math.min(today / perUserDailyCap, 1) : 0;
            return (
              <tr key={r.userId}>
                <td style={cellStyle}>{r.email ?? r.userId.slice(0, 8)}</td>
                <td style={cellStyle}>{r.role ?? "—"}</td>
                <td style={cellStyle}>
                  {formatNumber(today)}
                  {perUserDailyCap > 0 ? (
                    <SizableText size="$1" theme="alt2">
                      {" "}
                      ({formatPercent(todayPercent)})
                    </SizableText>
                  ) : null}
                </td>
                <td style={cellStyle}>{formatNumber(month)}</td>
                <td style={cellStyle}>{limit > 0 ? formatNumber(limit) : "—"}</td>
                <td style={cellStyle}>{limit > 0 ? formatPercent(percent) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </View>
  );
}

const cellHeaderStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "1px solid var(--borderColor, #444)",
  fontWeight: 600,
};

const cellStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "1px solid var(--borderColor, #333)",
};
