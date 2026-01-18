"use client";

import type { Point } from "./types";
import { pointsToSmoothPath } from "./utils";

interface StrokePathProps {
  points: Point[];
  color: string;
  width: number;
  id?: string;
}

export function StrokePath({ points, color, width, id }: StrokePathProps) {
  const pathData = pointsToSmoothPath(points);
  if (!pathData) return null;

  return (
    <path
      key={id}
      d={pathData}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ pointerEvents: "none" }}
    />
  );
}
