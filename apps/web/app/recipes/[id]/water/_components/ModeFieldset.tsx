"use client";

export type ModeOption<T extends string> = { value: T; label: string };

export function ModeFieldset<T extends string>(props: {
  legend: string;
  name: string;
  value: T;
  onChange: (next: T) => void;
  options: ModeOption<T>[];
}) {
  const { legend, name, value, onChange, options } = props;

  return (
    <fieldset
      className="modeFieldset"
      suppressHydrationWarning
    >
      <legend className="muted" style={{ fontSize: 12, padding: "0 6px" }}>
        {legend}
      </legend>
      <div style={{ display: "grid", gap: 8 }}>
        {options.map((o) => (
          <label key={o.value} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

