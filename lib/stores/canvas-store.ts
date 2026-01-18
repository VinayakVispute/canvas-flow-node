import { create } from "zustand";
import { applyNodeChanges, type Node, type NodeChange } from "@xyflow/react";
import type { Stroke } from "@/components/drawing-layer";
import type {
  CanvasSnapshot,
  HistoryActionType,
  HistoryEntry,
} from "./history-types";

const MAX_HISTORY_SIZE = 50;

interface CanvasStoreState {
  nodes: Node[];
  strokes: Stroke[];
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
}

interface CanvasStoreActions {
  setNodes: (nodes: Node[]) => void;
  applyNodeChanges: (changes: NodeChange[]) => void;
  addNodes: (nodes: Node[]) => void;
  deleteNodes: (nodeIds: string[]) => void;
  updateNodeData: (nodeId: string, updates: Record<string, unknown>) => void;

  setStrokes: (strokes: Stroke[]) => void;
  addStroke: (stroke: Stroke) => void;
  deleteStrokes: (strokeIds: string[]) => void;
  clearStrokes: () => void;
  moveStrokes: (strokeIds: string[], deltaX: number, deltaY: number) => void;

  getSnapshot: () => CanvasSnapshot;
  pushHistory: (type: HistoryActionType, snapshot?: CanvasSnapshot) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export type CanvasStore = CanvasStoreState & CanvasStoreActions;

const cloneSnapshot = (snapshot: CanvasSnapshot): CanvasSnapshot => {
  if (typeof structuredClone === "function") {
    return structuredClone(snapshot);
  }
  return JSON.parse(JSON.stringify(snapshot)) as CanvasSnapshot;
};

const createHistoryEntry = (
  type: HistoryActionType,
  snapshot: CanvasSnapshot
): HistoryEntry => ({
  type,
  timestamp: Date.now(),
  snapshot: cloneSnapshot(snapshot),
});

const withHistoryUpdate = (
  state: CanvasStoreState,
  type: HistoryActionType,
  snapshot: CanvasSnapshot
) => {
  const entry = createHistoryEntry(type, snapshot);
  const nextUndoStack = [...state.undoStack, entry].slice(-MAX_HISTORY_SIZE);
  return {
    undoStack: nextUndoStack,
    redoStack: [],
  };
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  strokes: [],
  undoStack: [],
  redoStack: [],

  setNodes: (nodes) => set({ nodes }),

  applyNodeChanges: (changes) => {
    set((state) => {
      const hasRemove = changes.some((change) => change.type === "remove");
      const nextNodes = applyNodeChanges(changes, state.nodes);

      if (hasRemove) {
        return {
          nodes: nextNodes,
          ...withHistoryUpdate(state, "node_delete", {
            nodes: state.nodes,
            strokes: state.strokes,
          }),
        };
      }

      return { nodes: nextNodes };
    });
  },

  addNodes: (nodes) =>
    set((state) => ({
      nodes: [...state.nodes, ...nodes],
      ...withHistoryUpdate(state, "node_add", {
        nodes: state.nodes,
        strokes: state.strokes,
      }),
    })),

  deleteNodes: (nodeIds) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => !nodeIds.includes(node.id)),
      ...withHistoryUpdate(state, "node_delete", {
        nodes: state.nodes,
        strokes: state.strokes,
      }),
    })),

  updateNodeData: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            }
          : node
      ),
    })),

  setStrokes: (strokes) => set({ strokes }),

  addStroke: (stroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
      ...withHistoryUpdate(state, "stroke_add", {
        nodes: state.nodes,
        strokes: state.strokes,
      }),
    })),

  deleteStrokes: (strokeIds) =>
    set((state) => ({
      strokes: state.strokes.filter((stroke) => !strokeIds.includes(stroke.id)),
      ...withHistoryUpdate(state, "stroke_delete", {
        nodes: state.nodes,
        strokes: state.strokes,
      }),
    })),

  clearStrokes: () =>
    set((state) => {
      if (state.strokes.length === 0) return state;
      return {
        strokes: [],
        ...withHistoryUpdate(state, "stroke_clear", {
          nodes: state.nodes,
          strokes: state.strokes,
        }),
      };
    }),

  moveStrokes: (strokeIds, deltaX, deltaY) =>
    set((state) => ({
      strokes: state.strokes.map((stroke) => {
        if (!strokeIds.includes(stroke.id)) return stroke;
        return {
          ...stroke,
          points: stroke.points.map((point) => ({
            x: point.x + deltaX,
            y: point.y + deltaY,
          })),
        };
      }),
    })),

  getSnapshot: () => {
    const state = get();
    return cloneSnapshot({
      nodes: state.nodes,
      strokes: state.strokes,
    });
  },

  pushHistory: (type, snapshot) => {
    const state = get();
    const targetSnapshot =
      snapshot ?? cloneSnapshot({ nodes: state.nodes, strokes: state.strokes });
    set(withHistoryUpdate(state, type, targetSnapshot));
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      const redoEntry = createHistoryEntry("batch", {
        nodes: state.nodes,
        strokes: state.strokes,
      });

      return {
        nodes: cloneSnapshot(previous.snapshot).nodes,
        strokes: cloneSnapshot(previous.snapshot).strokes,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, redoEntry],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);
      const undoEntry = createHistoryEntry("batch", {
        nodes: state.nodes,
        strokes: state.strokes,
      });

      return {
        nodes: cloneSnapshot(next.snapshot).nodes,
        strokes: cloneSnapshot(next.snapshot).strokes,
        undoStack: [...state.undoStack, undoEntry].slice(-MAX_HISTORY_SIZE),
        redoStack: newRedoStack,
      };
    });
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}));
