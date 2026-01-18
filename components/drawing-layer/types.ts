export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
}

export type LayerPosition = "above" | "below";

export interface DrawingState {
  // Drawing mode
  isDrawingMode: boolean;

  // Current stroke being drawn
  currentStroke: Point[] | null;

  // Completed strokes
  strokes: Stroke[];

  // Styling
  strokeColor: string;
  strokeWidth: number;

  // Layer position relative to nodes
  layerPosition: LayerPosition;

  // Undo/Redo stacks (store snapshots of strokes array)
  undoStack: Stroke[][];
  redoStack: Stroke[][];
}

export interface DrawingActions {
  // Mode toggle
  setDrawingMode: (enabled: boolean) => void;
  toggleDrawingMode: () => void;

  // Stroke operations
  startStroke: (point: Point) => void;
  addPoint: (point: Point) => void;
  endStroke: () => void;

  // Styling
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  // Layer position
  setLayerPosition: (position: LayerPosition) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Clear
  clearAll: () => void;
}

export type DrawingStore = DrawingState & DrawingActions;

// Default values
export const DEFAULT_STROKE_COLOR = "#000000";
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_LAYER_POSITION: LayerPosition = "above";

// Color presets for the color picker
export const COLOR_PRESETS = [
  "#000000", // Black
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#22C55E", // Green
  "#F97316", // Orange
  "#A855F7", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
] as const;

// Width options for the thickness control
export const WIDTH_OPTIONS = [1, 2, 4, 6, 8] as const;
