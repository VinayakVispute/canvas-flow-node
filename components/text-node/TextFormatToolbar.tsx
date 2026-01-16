"use client";

import { NodeToolbar } from "@xyflow/react";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TextFormatting, TextAlignment } from "./types";

interface TextFormatToolbarProps {
  formatting: TextFormatting;
  onFormattingChange: (formatting: Partial<TextFormatting>) => void;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];
const COLORS = [
  "#000000",
  "#374151",
  "#6B7280",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

export function TextFormatToolbar({
  formatting,
  onFormattingChange,
}: TextFormatToolbarProps) {
  const handleFontSizeChange = (delta: number) => {
    const currentIndex = FONT_SIZES.indexOf(formatting.fontSize);
    const newIndex = Math.max(0, Math.min(FONT_SIZES.length - 1, currentIndex + delta));
    onFormattingChange({ fontSize: FONT_SIZES[newIndex] });
  };

  const handleAlignmentChange = (alignment: TextAlignment) => {
    onFormattingChange({ alignment });
  };

  return (
    <NodeToolbar className="flex items-center gap-1 rounded-lg border bg-background p-1.5 shadow-lg">
      {/* Font Size Controls */}
      <div className="flex items-center gap-1 border-r pr-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 transition-colors"
          onClick={() => handleFontSizeChange(-1)}
          aria-label="Decrease font size"
          title="Decrease font size"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="min-w-[32px] text-center text-xs font-medium">
          {formatting.fontSize}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 transition-colors"
          onClick={() => handleFontSizeChange(1)}
          aria-label="Increase font size"
          title="Increase font size"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Bold & Italic */}
      <div className="flex items-center gap-0.5 border-r pr-2">
        <Button
          variant={formatting.bold ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7 transition-colors"
          onClick={() => onFormattingChange({ bold: !formatting.bold })}
          aria-label="Toggle bold"
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={formatting.italic ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7 transition-colors"
          onClick={() => onFormattingChange({ italic: !formatting.italic })}
          aria-label="Toggle italic"
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 border-r pr-2">
        <Button
          variant={formatting.alignment === "left" ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7 transition-colors"
          onClick={() => handleAlignmentChange("left")}
          aria-label="Align left"
          title="Align left"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={formatting.alignment === "center" ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7 transition-colors"
          onClick={() => handleAlignmentChange("center")}
          aria-label="Align center"
          title="Align center"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={formatting.alignment === "right" ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-7 transition-colors"
          onClick={() => handleAlignmentChange("right")}
          aria-label="Align right"
          title="Align right"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-1 pl-1">
        <div className="flex gap-0.5">
          {COLORS.map((color) => (
            <button
              key={color}
              className={`h-5 w-5 rounded-sm border transition-transform hover:scale-110 ${
                formatting.color === color
                  ? "border-foreground ring-1 ring-foreground ring-offset-1"
                  : "border-border"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onFormattingChange({ color })}
              aria-label={`Set color to ${color}`}
              title={color}
            />
          ))}
        </div>
      </div>
    </NodeToolbar>
  );
}
