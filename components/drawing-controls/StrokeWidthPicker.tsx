"use client";

import { cn } from "@/lib/utils";

interface StrokeWidthPickerProps {
  widths: readonly number[];
  selectedWidth: number;
  onWidthChange: (width: number) => void;
}

export function StrokeWidthPicker({
  widths,
  selectedWidth,
  onWidthChange,
}: StrokeWidthPickerProps) {
  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Stroke width"
    >
      {widths.map((width) => (
        <button
          key={width}
          onClick={() => onWidthChange(width)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded border transition-colors",
            selectedWidth === width
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30 hover:border-muted-foreground/50"
          )}
          aria-label={`Set stroke width to ${width}px`}
          title={`${width}px`}
        >
          <div
            className="rounded-full bg-foreground"
            style={{
              width: Math.min(width + 2, 12),
              height: Math.min(width + 2, 12),
            }}
          />
        </button>
      ))}
    </div>
  );
}
