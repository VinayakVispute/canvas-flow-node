"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearButtonProps {
  disabled: boolean;
  onClear: () => void;
}

export function ClearButton({ disabled, onClear }: ClearButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClear}
      disabled={disabled}
      className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
      aria-label="Clear all drawings"
      title="Clear All"
    >
      <Trash2 className="h-4 w-4" />
      <span className="hidden sm:inline">Clear</span>
    </Button>
  );
}
