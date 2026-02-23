"use client";

import { Select } from "tamagui";

export interface BrewSelectOption {
  value: string;
  label: string;
}

export interface BrewSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: BrewSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  width?: "auto" | "full";
  tone?: "default" | "success" | "warning" | "info" | "danger";
}

export function BrewSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  width = "auto",
  tone = "default",
}: BrewSelectProps) {
  const triggerStyles =
    tone === "success"
      ? {
          backgroundColor: "color-mix(in srgb, var(--success) 14%, var(--surface))",
          borderColor: "color-mix(in srgb, var(--success) 40%, var(--border))",
        }
      : tone === "warning"
        ? {
            backgroundColor: "color-mix(in srgb, var(--warning) 14%, var(--surface))",
            borderColor: "color-mix(in srgb, var(--warning) 40%, var(--border))",
          }
        : tone === "info"
          ? {
              backgroundColor: "color-mix(in srgb, var(--info) 14%, var(--surface))",
              borderColor: "color-mix(in srgb, var(--info) 35%, var(--border))",
            }
          : tone === "danger"
            ? {
                backgroundColor: "color-mix(in srgb, var(--danger) 12%, var(--surface))",
                borderColor: "color-mix(in srgb, var(--danger) 35%, var(--border))",
              }
            : {
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              };

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      size="$3"
      width={width === "full" ? "100%" : 160}
      minWidth={width === "full" ? undefined : 160}
      lazyMount
      renderValue={(v) => options.find((opt) => opt.value === v)?.label ?? v}
    >
      <Select.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        iconAfter={null}
        size="$3"
        width={width === "full" ? "100%" : 160}
        minWidth={width === "full" ? undefined : 160}
        flexGrow={0}
        flexShrink={0}
        jc="flex-start"
        px="$2"
        py="$2"
        color="var(--text)"
        backgroundColor={triggerStyles.backgroundColor}
        borderWidth={1}
        borderColor={triggerStyles.borderColor}
        borderRadius="$2"
        fontFamily="$body"
      >
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>
      <Select.Content bordered={undefined}>
        <Select.Viewport elevate={undefined} bordered={undefined} elevation={0}>
          <Select.Group>
            {options.map((opt, idx) => (
              <Select.Item key={opt.value} index={idx} value={opt.value}>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}
