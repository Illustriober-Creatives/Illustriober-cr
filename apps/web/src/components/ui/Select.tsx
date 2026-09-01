"use client";

import { Check, ChevronDown } from "lucide-react";
import { Popover, usePopover } from "./Popover";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Stretch to the width of the parent, matching a native full-width form <select>. */
  fullWidth?: boolean;
  "aria-label"?: string;
}

/** Brand-styled stand-in for a native <select>, built on the shared Popover primitive. */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  fullWidth,
  "aria-label": ariaLabel,
}: SelectProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <Popover className={fullWidth ? "w-full" : ""}>
      <Popover.Trigger
        disabled={disabled}
        aria-label={ariaLabel}
        className={`flex items-center justify-between gap-2 rounded-lg border border-glass-border bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:border-accent/40 focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-50 ${
          fullWidth ? "w-full" : ""
        } ${className ?? ""}`}
      >
        <span className={selected ? "" : "text-foreground/40"}>{selected?.label ?? placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground/40" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Content className={`max-h-64 overflow-y-auto py-1 ${fullWidth ? "w-full min-w-full" : "min-w-full"}`}>
        <SelectOptions options={options} value={value} onChange={onChange} />
      </Popover.Content>
    </Popover>
  );
}

function SelectOptions({ options, value, onChange }: Pick<SelectProps, "options" | "value" | "onChange">) {
  const { setOpen } = usePopover();

  return (
    <>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="menuitemradio"
          aria-checked={option.value === value}
          onClick={() => {
            onChange(option.value);
            setOpen(false);
          }}
          className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-glass-bg ${
            option.value === value ? "text-accent" : "text-foreground"
          }`}
        >
          {option.label}
          {option.value === value && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        </button>
      ))}
    </>
  );
}
