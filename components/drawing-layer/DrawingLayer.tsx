"use client";

import { useViewport } from "@xyflow/react";
import { useDrawingStore } from "./useDrawingStore";
import { StrokePath } from "./StrokePath";
import { useDrawingEvents } from "./hooks";
import type { Stroke } from "./types";

interface DrawingLayerProps {
  /** Whether the drawing layer should appear above or below nodes */
  position?: "above" | "below";
}

export function DrawingLayer({ position = "above" }: DrawingLayerProps) {
  const viewport = useViewport();

  const {
    isDrawingMode,
    strokes,
    currentStroke,
    strokeColor,
    strokeWidth,
    startStroke,
    addPoint,
    endStroke,
  } = useDrawingStore();

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  } = useDrawingEvents({
    isDrawingMode,
    startStroke,
    addPoint,
    endStroke,
  });

  const zIndex = position === "above" ? 5 : 1;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      style={{
        zIndex,
        cursor: isDrawingMode ? "crosshair" : "default",
        pointerEvents: isDrawingMode ? "auto" : "none",
        touchAction: isDrawingMode ? "none" : "auto",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
    >
      <g
        transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
      >
        {strokes.map((stroke: Stroke) => (
          <StrokePath
            key={stroke.id}
            id={stroke.id}
            points={stroke.points}
            color={stroke.color}
            width={stroke.width}
          />
        ))}
        {currentStroke && currentStroke.length > 0 ? (
          <StrokePath
            points={currentStroke}
            color={strokeColor}
            width={strokeWidth}
          />
        ) : null}
      </g>
    </svg>
  );
}
