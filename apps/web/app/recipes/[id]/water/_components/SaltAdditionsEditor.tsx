"use client";

import { useTranslations } from "next-intl";

export type SaltKey = "gypsum" | "calcium_chloride" | "epsom" | "table_salt" | "baking_soda";
export type SaltAdditionRow = { saltKey: SaltKey; grams: number };

export function SaltAdditionsEditor(props: {
  rows: SaltAdditionRow[];
  onChange: (next: SaltAdditionRow[]) => void;
  idPrefix: string;
  disabled?: boolean;
}) {
  const tUi = useTranslations("ui");
  const tUnits = useTranslations("units");
  const { rows, onChange, idPrefix, disabled } = props;

  const addRow = () => onChange([...rows, { saltKey: "gypsum", grams: 0 }]);
  const updateRow = (idx: number, next: Partial<SaltAdditionRow>) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...next } : r)));
  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.length ? (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((row, idx) => (
            <div key={idx} style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr auto" }}>
              <div>
                <label
                  htmlFor={`${idPrefix}-salt-key-${idx}`}
                  className="muted"
                  style={{ display: "block", fontSize: 12 }}
                >
                  Salt
                </label>
                <select
                  id={`${idPrefix}-salt-key-${idx}`}
                  value={row.saltKey}
                  onChange={(e) => updateRow(idx, { saltKey: e.target.value as SaltKey })}
                  style={{ width: "100%", padding: 8 }}
                  disabled={disabled}
                >
                  <option value="gypsum">Gypsum (CaSO4·2H2O)</option>
                  <option value="calcium_chloride">Calcium chloride (CaCl2·2H2O)</option>
                  <option value="epsom">Epsom (MgSO4·7H2O)</option>
                  <option value="table_salt">Table salt (NaCl)</option>
                  <option value="baking_soda">Baking soda (NaHCO3)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor={`${idPrefix}-salt-grams-${idx}`}
                  className="muted"
                  style={{ display: "block", fontSize: 12 }}
                >
                  {tUi("amountLabel", { unit: tUnits("g") })}
                </label>
                <input
                  id={`${idPrefix}-salt-grams-${idx}`}
                  type="number"
                  inputMode="decimal"
                  step={0.1}
                  value={row.grams}
                  onChange={(e) => updateRow(idx, { grams: Number(e.target.value) })}
                  style={{ width: "100%", padding: 8 }}
                  disabled={disabled}
                />
              </div>
              <div style={{ alignSelf: "end" }}>
                <button type="button" onClick={() => removeRow(idx)} disabled={disabled}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          No salts added yet.
        </p>
      )}

      <div>
        <button type="button" onClick={addRow} disabled={disabled}>
          {tUi("addSalt")}
        </button>
      </div>
    </div>
  );
}

