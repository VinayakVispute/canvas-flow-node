import { create } from "zustand";
import type {
  DrawingStore,
  Point,
  Stroke,
} from "./types";
import {
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_LAYER_POSITION,
} from "./types";

export const useDrawingStore = create<DrawingStore>((set, get) => ({
  // Initial state
  isDrawingMode: false,
  currentStroke: null,
  strokes: [],
  strokeColor: DEFAULT_STROKE_COLOR,
  strokeWidth: DEFAULT_STROKE_WIDTH,
  layerPosition: DEFAULT_LAYER_POSITION,
  undoStack: [],
  redoStack: [],

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

    set({
      strokes: [...state.strokes, newStroke],
      currentStroke: null,
      // Save current strokes to undo stack before adding new stroke
      undoStack: [...state.undoStack, state.strokes],
      // Clear redo stack when new action is performed
      redoStack: [],
    });
  },

  // Styling
  setStrokeColor: (color) => set({ strokeColor: color }),

  setStrokeWidth: (width) => set({ strokeWidth: width }),

  // Layer position
  setLayerPosition: (position) => set({ layerPosition: position }),

  // Undo
  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const previousStrokes = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);

    set({
      strokes: previousStrokes,
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, state.strokes],
    });
  },

  // Redo
  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const nextStrokes = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);

    set({
      strokes: nextStrokes,
      undoStack: [...state.undoStack, state.strokes],
      redoStack: newRedoStack,
    });
  },

  canUndo: () => get().undoStack.length > 0,

  canRedo: () => get().redoStack.length > 0,

  // Clear all strokes
  clearAll: () => {
    const state = get();
    if (state.strokes.length === 0) return;

    set({
      strokes: [],
      currentStroke: null,
      undoStack: [...state.undoStack, state.strokes],
      redoStack: [],
    });
  },
}));
