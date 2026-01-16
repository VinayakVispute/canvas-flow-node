"use client";

import { Type } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasToolbarProps {
  onAddText: () => void;
}

export function CanvasToolbar({ onAddText }: CanvasToolbarProps) {
  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2 rounded-lg border bg-background p-2 shadow-md">
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
    </div>
  );
}
