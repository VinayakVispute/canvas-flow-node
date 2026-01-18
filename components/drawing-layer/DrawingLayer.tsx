"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useReactFlow, useViewport } from "@xyflow/react";
import { useDrawingStore } from "./useDrawingStore";
import { StrokePath } from "./StrokePath";
import { useDrawingEvents } from "./hooks";
import type { Stroke, CursorMode, Point } from "./types";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { CanvasSnapshot } from "@/lib/stores/history-types";

interface DrawingLayerProps {
  /** Whether the drawing layer should appear above or below nodes */
  position?: "above" | "below";
}

export function DrawingLayer({ position = "above" }: DrawingLayerProps) {
  const { screenToFlowPosition } = useReactFlow();
  const viewport = useViewport();

  const {
    isDrawingMode,
    cursorMode,
    isSpaceHeld,
    currentStroke,
    strokeColor,
    strokeWidth,
    startStroke,
    addPoint,
    endStroke,
    selectedStrokeIds,
    selectStroke,
    setSelectedStrokeIds,
    deselectAllStrokes,
    moveSelectedStrokes,
  } = useDrawingStore();
  const { strokes, getSnapshot, pushHistory } = useCanvasStore();

  const dragStartPoint = useRef<Point | null>(null);
  const isDraggingStroke = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartSnapshot = useRef<CanvasSnapshot | null>(null);
  const hasMoved = useRef(false);

  // Effective mode: space bar temporarily overrides to grab
  const effectiveMode: CursorMode = useMemo(
    () => (isSpaceHeld ? "grab" : cursorMode),
    [cursorMode, isSpaceHeld]
  );

  const {
    handlePointerDown: handleDrawingPointerDown,
    handlePointerMove: handleDrawingPointerMove,
    handlePointerUp: handleDrawingPointerUp,
    handlePointerLeave: handleDrawingPointerLeave,
  } = useDrawingEvents({
    isDrawingMode,
    startStroke,
    addPoint,
    endStroke,
  });

  const zIndex = position === "above" ? 5 : 1;

  const getFlowPoint = useCallback(
    (event: React.PointerEvent): Point => {
      const pos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      return { x: pos.x, y: pos.y };
    },
    [screenToFlowPosition]
  );

  // Handle stroke click from StrokePath component
  const handleStrokePointerDown = useCallback(
    (event: React.PointerEvent, strokeId: string) => {
      // Only handle in pointer mode
      if (effectiveMode !== "pointer" || isDrawingMode) return;

      // Only handle primary button
      if (event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();

      const point = getFlowPoint(event);
      const addToSelection = event.shiftKey;

      selectStroke(strokeId, addToSelection);
      isDraggingStroke.current = true;
      dragStartPoint.current = point;
      dragStartSnapshot.current = getSnapshot();
      hasMoved.current = false;

      // Capture pointer on the SVG for drag tracking
      if (svgRef.current) {
        svgRef.current.setPointerCapture(event.pointerId);
      }
    },
    [effectiveMode, isDrawingMode, getFlowPoint, selectStroke, getSnapshot]
  );

  // Handle pointer move for stroke dragging (on SVG level for captured events)
  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      // Drawing mode uses its own handler
      if (isDrawingMode) {
        handleDrawingPointerMove(event);
        return;
      }

      // Handle stroke dragging
      if (isDraggingStroke.current && effectiveMode === "pointer") {
        event.preventDefault();
        event.stopPropagation();

        const point = getFlowPoint(event);
        const lastPoint = dragStartPoint.current;
        if (!lastPoint) return;

        const deltaX = point.x - lastPoint.x;
        const deltaY = point.y - lastPoint.y;

        // Small threshold to avoid micro-movements
        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          moveSelectedStrokes(deltaX, deltaY);
          dragStartPoint.current = point;
          hasMoved.current = true;
        }
      }
    },
    [
      isDrawingMode,
      effectiveMode,
      getFlowPoint,
      moveSelectedStrokes,
      handleDrawingPointerMove,
    ]
  );

  // Handle pointer up - end drag
  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (isDrawingMode) {
        handleDrawingPointerUp(event);
        return;
      }

      if (isDraggingStroke.current) {
        isDraggingStroke.current = false;
        dragStartPoint.current = null;

        if (hasMoved.current && dragStartSnapshot.current) {
          pushHistory("stroke_move", dragStartSnapshot.current);
        }

        hasMoved.current = false;
        dragStartSnapshot.current = null;

        try {
          if (svgRef.current) {
            svgRef.current.releasePointerCapture(event.pointerId);
          }
        } catch {
          // Ignore if capture was already released
        }
      }
    },
    [isDrawingMode, handleDrawingPointerUp]
  );

  // Handle pointer leave
  const handlePointerLeave = useCallback(
    (event: React.PointerEvent) => {
      if (isDrawingMode) {
        handleDrawingPointerLeave(event);
        return;
      }

      // Don't end drag on leave if we have pointer capture
      if (
        isDraggingStroke.current &&
        svgRef.current &&
        !svgRef.current.hasPointerCapture(event.pointerId)
      ) {
        isDraggingStroke.current = false;
        dragStartPoint.current = null;
      }
    },
    [isDrawingMode, handleDrawingPointerLeave]
  );

  // Handle click on empty SVG area (only in drawing mode for drawing)
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (isDrawingMode) {
        handleDrawingPointerDown(event);
        return;
      }

      // In pointer mode, clicking on empty area deselects strokes
      // But we let the event pass through to ReactFlow
      if (effectiveMode === "pointer" && selectedStrokeIds.length > 0) {
        // Only deselect if we clicked the SVG background, not a stroke
        if (event.target === svgRef.current) {
          deselectAllStrokes();
        }
      }
    },
    [
      isDrawingMode,
      effectiveMode,
      selectedStrokeIds,
      deselectAllStrokes,
      handleDrawingPointerDown,
    ]
  );

  useEffect(() => {
    if (selectedStrokeIds.length === 0) return;
    const strokeIds = new Set(strokes.map((stroke) => stroke.id));
    const nextSelected = selectedStrokeIds.filter((id) => strokeIds.has(id));
    if (nextSelected.length !== selectedStrokeIds.length) {
      setSelectedStrokeIds(nextSelected);
    }
  }, [strokes, selectedStrokeIds, setSelectedStrokeIds]);

  // Determine cursor style
  const cursor = useMemo(() => {
    if (isDrawingMode) return "crosshair";
    if (effectiveMode === "grab") return "grab";
    return "default";
  }, [isDrawingMode, effectiveMode]);

  // In drawing mode: SVG captures all events
  // In pointer/grab mode: SVG is transparent, only strokes capture events
  const svgPointerEvents = isDrawingMode ? "auto" : "none";

  // Strokes are interactive only in pointer mode (not drawing, not grab)
  const strokesInteractive = !isDrawingMode && effectiveMode === "pointer";

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 h-full w-full"
      style={{
        zIndex,
        cursor,
        pointerEvents: svgPointerEvents,
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
        style={{ pointerEvents: strokesInteractive ? "auto" : "none" }}
      >
        {strokes.map((stroke: Stroke) => (
          <StrokePath
            key={stroke.id}
            id={stroke.id}
            points={stroke.points}
            color={stroke.color}
            width={stroke.width}
            isSelected={selectedStrokeIds.includes(stroke.id)}
            interactive={strokesInteractive}
            onPointerDown={handleStrokePointerDown}
          />
        ))}
        {currentStroke && currentStroke.length > 0 && (
          <StrokePath
            points={currentStroke}
            color={strokeColor}
            width={strokeWidth}
          />
        )}
      </g>
    </svg>
  );
}
