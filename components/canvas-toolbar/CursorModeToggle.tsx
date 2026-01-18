"use client";

import { Hand, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CursorMode } from "@/components/drawing-layer";

interface CursorModeToggleProps {
  mode: CursorMode;
  isSpaceHeld?: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function CursorModeToggle({
  mode,
  isSpaceHeld = false,
  disabled = false,
  onToggle,
}: CursorModeToggleProps) {
  // Show grab visual when space is held (temporary) or mode is grab (permanent)
  const showGrab = isSpaceHeld || mode === "grab";

  return (
    <Button
      variant={showGrab ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2 transition-colors"
      aria-label={showGrab ? "Grab mode (panning)" : "Pointer mode (select)"}
      title={
        showGrab
          ? "Grab mode - Pan the canvas"
          : "Pointer mode - Select and move objects"
      }
      disabled={disabled}
    >
      {showGrab ? (
        <Hand className="h-4 w-4" />
      ) : (
        <MousePointer2 className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{showGrab ? "Grab" : "Pointer"}</span>
    </Button>
  );
}
