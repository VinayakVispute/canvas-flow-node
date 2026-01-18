import { create } from "zustand";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { DrawingStore, Point, Stroke } from "./types";
import {
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_LAYER_POSITION,
} from "./types";

export const useDrawingStore = create<DrawingStore>((set, get) => ({
  // Initial state
  isDrawingMode: false,
  cursorMode: "pointer",
  isSpaceHeld: false,
  currentStroke: null,
  strokeColor: DEFAULT_STROKE_COLOR,
  strokeWidth: DEFAULT_STROKE_WIDTH,
  layerPosition: DEFAULT_LAYER_POSITION,
  selectedStrokeIds: [],

  // Mode toggle
  setDrawingMode: (enabled) => set({ isDrawingMode: enabled }),

  toggleDrawingMode: () =>
    set((state) => ({ isDrawingMode: !state.isDrawingMode })),

  // Stroke operations
  startStroke: (point: Point) => {
    set({ currentStroke: [point] });
  },

  addPoint: (point: Point) => {
    set((state) => {
      if (!state.currentStroke) return state;
      return {
        currentStroke: [...state.currentStroke, point],
      };
    });
  },

  endStroke: () => {
    const state = get();
    if (!state.currentStroke || state.currentStroke.length < 2) {
      // Not enough points to form a stroke
      set({ currentStroke: null });
      return;
    }

    const newStroke: Stroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: state.currentStroke,
      color: state.strokeColor,
      width: state.strokeWidth,
    };

    useCanvasStore.getState().addStroke(newStroke);
    set({ currentStroke: null });
  },

  // Styling
  setStrokeColor: (color) => set({ strokeColor: color }),

  setStrokeWidth: (width) => set({ strokeWidth: width }),

  // Layer position
  setLayerPosition: (position) => set({ layerPosition: position }),

  // Cursor mode
  setCursorMode: (mode) => set({ cursorMode: mode }),

  setSpaceHeld: (held) => set({ isSpaceHeld: held }),

  // Selection
  selectStroke: (id, addToSelection = false) => {
    set((state) => {
      if (addToSelection) {
        const alreadySelected = state.selectedStrokeIds.includes(id);
        return {
          selectedStrokeIds: alreadySelected
            ? state.selectedStrokeIds.filter((selectedId) => selectedId !== id)
            : [...state.selectedStrokeIds, id],
        };
      }

      return { selectedStrokeIds: [id] };
    });
  },

  setSelectedStrokeIds: (ids) => set({ selectedStrokeIds: ids }),

  deselectAllStrokes: () => set({ selectedStrokeIds: [] }),

  deleteSelectedStrokes: () => {
    const state = get();
    if (state.selectedStrokeIds.length === 0) return;

    useCanvasStore.getState().deleteStrokes(state.selectedStrokeIds);
    set({ selectedStrokeIds: [] });
  },

  moveSelectedStrokes: (deltaX, deltaY) => {
    const state = get();
    if (state.selectedStrokeIds.length === 0) return;
    useCanvasStore
      .getState()
      .moveStrokes(state.selectedStrokeIds, deltaX, deltaY);
  },
}));
