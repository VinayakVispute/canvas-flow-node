"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { rafThrottle } from "../utils";
import type { Point } from "../types";

interface UseDrawingEventsOptions {
  isDrawingMode: boolean;
  startStroke: (point: Point) => void;
  addPoint: (point: Point) => void;
  endStroke: () => void;
}

export function useDrawingEvents({
  isDrawingMode,
  startStroke,
  addPoint,
  endStroke,
}: UseDrawingEventsOptions) {
  const { screenToFlowPosition } = useReactFlow();
  const isDrawing = useRef(false);

  const throttledAddPoint = useMemo(
    () =>
      rafThrottle((point: Point) => {
        addPoint(point);
      }),
    [addPoint]
  );

  useEffect(() => {
    return () => throttledAddPoint.cancel();
  }, [throttledAddPoint]);

  const getFlowPosition = useCallback(
    (event: React.PointerEvent): Point => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      return { x: position.x, y: position.y };
    },
    [screenToFlowPosition]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!isDrawingMode) return;
      if (event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();

      isDrawing.current = true;
      const point = getFlowPosition(event);
      startStroke(point);

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [getFlowPosition, isDrawingMode, startStroke]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isDrawingMode || !isDrawing.current) return;

      event.preventDefault();
      event.stopPropagation();

      const point = getFlowPosition(event);
      throttledAddPoint(point);
    },
    [getFlowPosition, isDrawingMode, throttledAddPoint]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!isDrawing.current) return;

      event.preventDefault();
      event.stopPropagation();

      isDrawing.current = false;
      endStroke();

      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    [endStroke]
  );

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent) => {
      if (!isDrawing.current) return;

      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        isDrawing.current = false;
        endStroke();
      }
    },
    [endStroke]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  };
}
