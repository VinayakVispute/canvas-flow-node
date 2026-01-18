"use client";

import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayerPositionToggleProps {
  position: "above" | "below";
  onToggle: () => void;
}

export function LayerPositionToggle({
  position,
  onToggle,
}: LayerPositionToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-1"
      aria-label={`Drawing layer is ${position} nodes. Click to toggle.`}
      title={`Layer: ${position === "above" ? "Above nodes" : "Below nodes"}`}
    >
      <Layers className="h-4 w-4" />
      <span className="hidden text-xs sm:inline">
        {position === "above" ? "Above" : "Below"}
      </span>
    </Button>
  );
}
