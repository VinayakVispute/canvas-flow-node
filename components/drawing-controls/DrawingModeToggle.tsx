"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DrawingModeToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export function DrawingModeToggle({
  isActive,
  onToggle,
}: DrawingModeToggleProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 transition-colors",
        isActive && "bg-primary text-primary-foreground"
      )}
      aria-label={isActive ? "Exit drawing mode" : "Enter drawing mode"}
      title={isActive ? "Exit Drawing Mode" : "Draw"}
    >
      <Pencil className="h-4 w-4" />
      <span className="hidden sm:inline">Draw</span>
    </Button>
  );
}
