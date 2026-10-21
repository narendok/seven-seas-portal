import { useState, type ReactNode } from "react";
import { Check, MoreHorizontal, type LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function ResponsiveFilterBar({
  children,
  secondary,
  activeCount = 0,
  label = "Filters",
  className = "",
}: {
  children: ReactNode;
  secondary?: ReactNode;
  activeCount?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`responsive-filter-shell ${className}`}>
      <div role="group" aria-label={label} className="responsive-filter-row">
        {children}
        {secondary && (
          <>
            <div className="filter-secondary-wide">{secondary}</div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="More filters"
                  aria-label={`More filters${activeCount ? ` (${activeCount} active)` : ""}`}
                  className="filter-more h-8 shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-2 text-xs"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="filter-short-label">More</span>
                  {activeCount > 0 && (
                    <span className="rounded bg-primary/10 px-1 text-primary">{activeCount}</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-3">
                {secondary}
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    </div>
  );
}

export function CompactFilterSelect({
  label,
  shortLabel,
  icon: Icon,
  value,
  options,
  onChange,
  secondary = false,
  defaultValue,
}: {
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  secondary?: boolean;
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const active = value !== (defaultValue ?? options[0]?.value);
  const description = `${label}: ${selected?.label ?? value}`;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={description}
          aria-label={description}
          className={`compact-filter-select ${secondary ? "filter-secondary" : ""} ${active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background text-foreground"}`}
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="filter-full-label">{label}</span>
          <span className="filter-short-label">{shortLabel ?? label}</span>
          <span className="filter-selected-value">{selected?.label ?? value}</span>
          {active && (
            <span
              aria-label="Active filter"
              className="filter-active-dot size-1.5 shrink-0 rounded-full bg-primary"
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput
            aria-label={`Find ${label.toLowerCase()} option`}
            placeholder={`Find ${label.toLowerCase()}…`}
          />
          <CommandList>
            <CommandEmpty>No matching options.</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={`${option.label} ${option.value}`}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 size-3.5 ${value === option.value ? "opacity-100" : "opacity-0"}`}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
