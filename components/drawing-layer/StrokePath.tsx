"use client";

import type { Point } from "./types";
import { pointsToSmoothPath } from "./utils";

interface StrokePathProps {
  points: Point[];
  color: string;
  width: number;
  id?: string;
  isSelected?: boolean;
  /** Whether this stroke can be interacted with (clicked/dragged) */
  interactive?: boolean;
  onPointerDown?: (event: React.PointerEvent, strokeId: string) => void;
}

export function StrokePath({
  points,
  color,
  width,
  id,
  isSelected = false,
  interactive = false,
  onPointerDown,
}: StrokePathProps) {
  const pathData = pointsToSmoothPath(points);
  if (!pathData) return null;

  const handlePointerDown = (event: React.PointerEvent) => {
    if (interactive && id && onPointerDown) {
      onPointerDown(event, id);
    }
  };

  // Hit area is wider than the visual stroke for easier selection
  const hitAreaWidth = Math.max(width + 12, 20);

  return (
    <g>
      {/* Selection highlight */}
      {isSelected && (
        <path
          d={pathData}
          fill="none"
          stroke="#2563eb"
          strokeWidth={width + 6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.4}
          style={{ pointerEvents: "none" }}
        />
      )}
      {/* Invisible hit area for easier clicking */}
      {interactive && (
        <path
          d={pathData}
          fill="none"
          stroke="transparent"
          strokeWidth={hitAreaWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
          onPointerDown={handlePointerDown}
        />
      )}
      {/* Visible stroke */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: "none" }}
      />
    </g>
  );
}
