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
export type CursorMode = "pointer" | "grab";

export interface DrawingState {
  // Drawing mode
  isDrawingMode: boolean;
  cursorMode: CursorMode;
  isSpaceHeld: boolean;

  // Current stroke being drawn
  currentStroke: Point[] | null;

  // Styling
  strokeColor: string;
  strokeWidth: number;

  // Layer position relative to nodes
  layerPosition: LayerPosition;

  // Selection
  selectedStrokeIds: string[];
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

  // Cursor mode
  setCursorMode: (mode: CursorMode) => void;
  setSpaceHeld: (held: boolean) => void;

  // Selection
  selectStroke: (id: string, addToSelection?: boolean) => void;
  setSelectedStrokeIds: (ids: string[]) => void;
  deselectAllStrokes: () => void;
  deleteSelectedStrokes: () => void;
  moveSelectedStrokes: (deltaX: number, deltaY: number) => void;
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
