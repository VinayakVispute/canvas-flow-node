"use client";

import { Separator } from "@/components/ui/separator";
import {
  COLOR_PRESETS,
  WIDTH_OPTIONS,
  useDrawingStore,
} from "@/components/drawing-layer";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import { DrawingModeToggle } from "./DrawingModeToggle";
import { ColorPicker } from "./ColorPicker";
import { StrokeWidthPicker } from "./StrokeWidthPicker";
import { LayerPositionToggle } from "./LayerPositionToggle";
import { UndoRedoButtons } from "./UndoRedoButtons";
import { ClearButton } from "./ClearButton";

export function DrawingControls() {
  const {
    isDrawingMode,
    toggleDrawingMode,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    layerPosition,
    setLayerPosition,
    deselectAllStrokes,
  } = useDrawingStore();
  const { strokes, undo, redo, canUndo, canRedo, clearStrokes } =
    useCanvasStore();

  const hasUndo = canUndo();
  const hasRedo = canRedo();
  const hasStrokes = strokes.length > 0;
  const handleClear = () => {
    clearStrokes();
    deselectAllStrokes();
  };

  return (
    <div className="flex items-center gap-2">
      <DrawingModeToggle
        isActive={isDrawingMode}
        onToggle={toggleDrawingMode}
      />

      {isDrawingMode && (
        <>
          <Separator orientation="vertical" className="h-6" />

          <ColorPicker
            colors={COLOR_PRESETS}
            selectedColor={strokeColor}
            onColorChange={setStrokeColor}
          />

          <Separator orientation="vertical" className="h-6" />

          <StrokeWidthPicker
            widths={WIDTH_OPTIONS}
            selectedWidth={strokeWidth}
            onWidthChange={setStrokeWidth}
          />

          <Separator orientation="vertical" className="h-6" />

          <LayerPositionToggle
            position={layerPosition}
            onToggle={() =>
              setLayerPosition(layerPosition === "above" ? "below" : "above")
            }
          />

          <Separator orientation="vertical" className="h-6" />

          <UndoRedoButtons
            canUndo={hasUndo}
            canRedo={hasRedo}
            onUndo={undo}
            onRedo={redo}
          />

          <ClearButton disabled={!hasStrokes} onClear={handleClear} />
        </>
      )}
    </div>
  );
}
