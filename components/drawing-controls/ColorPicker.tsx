"use client";

import { cn } from "@/lib/utils";

interface ColorPickerProps {
  colors: readonly string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({
  colors,
  selectedColor,
  onColorChange,
}: ColorPickerProps) {
  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Stroke color"
    >
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={cn(
            "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
            selectedColor === color
              ? "border-primary ring-2 ring-primary ring-offset-1"
              : "border-muted-foreground/30"
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
          title={color}
        />
      ))}
    </div>
  );
}
