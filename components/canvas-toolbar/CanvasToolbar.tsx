"use client";

import { FileDown, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrawingControls } from "@/components/drawing-controls";
import { CursorModeToggle } from "./CursorModeToggle";
import type { CursorMode } from "@/components/drawing-layer";

interface CanvasToolbarProps {
  onAddText: () => void;
  onExportSelected?: () => void;
  selectedImageCount?: number;
  cursorMode: CursorMode;
  isSpaceHeld?: boolean;
  isDrawingMode: boolean;
  onToggleCursorMode: () => void;
}

export function CanvasToolbar({
  onAddText,
  onExportSelected,
  selectedImageCount = 0,
  cursorMode,
  isSpaceHeld = false,
  isDrawingMode,
  onToggleCursorMode,
}: CanvasToolbarProps) {
  const hasSelection = selectedImageCount > 0;

  return (
    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg border bg-background p-2 shadow-md">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddText}
        className="flex items-center gap-2 transition-colors"
        aria-label="Add text to canvas"
        title="Add Text"
      >
        <Type className="h-4 w-4" />
        <span>Add Text</span>
      </Button>

      <CursorModeToggle
        mode={cursorMode}
        isSpaceHeld={isSpaceHeld}
        disabled={isDrawingMode}
        onToggle={onToggleCursorMode}
      />

      {hasSelection && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExportSelected}
          className="flex items-center gap-2 transition-colors"
          aria-label="Export selected images with drawings"
          title="Export Selected"
        >
          <FileDown className="h-4 w-4" />
          <span>Export Selected</span>
        </Button>
      )}

      <Separator orientation="vertical" className="h-6" />

      {/* Drawing Controls */}
      <DrawingControls />
    </div>
  );
}
