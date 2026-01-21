import { create } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import type { Stroke } from "@/components/drawing-layer";
import type {
  CanvasSnapshot,
  HistoryActionType,
  HistoryEntry,
} from "./history-types";

const MAX_HISTORY_SIZE = 50;

interface CanvasStoreState {
  nodes: Node[];
  edges: Edge[];
  strokes: Stroke[];
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  clipboard: Node[];
  nextZIndex: number;
}

interface CanvasStoreActions {
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  applyNodeChanges: (changes: NodeChange[]) => void;
  applyEdgeChanges: (changes: EdgeChange[]) => void;
  addNodes: (nodes: Node[]) => void;
  deleteNodes: (nodeIds: string[]) => void;
  updateNodeData: (nodeId: string, updates: Record<string, unknown>) => void;
  copyNodes: (nodeIds: string[]) => void;
  pasteNodes: (viewportCenter: { x: number; y: number }) => void;

  setStrokes: (strokes: Stroke[]) => void;
  addStroke: (stroke: Stroke) => void;
  deleteStrokes: (strokeIds: string[]) => void;
  clearStrokes: () => void;
  moveStrokes: (strokeIds: string[], deltaX: number, deltaY: number) => void;

  getSnapshot: () => CanvasSnapshot;
  pushHistory: (type: HistoryActionType, snapshot?: CanvasSnapshot) => void;
  exportCanvas: () => {
    version: string;
    nodes: Node[];
    edges: Edge[];
    strokes: Stroke[];
  };
  importCanvas: (data: {
    nodes: Node[];
    edges?: Edge[];
    strokes?: Stroke[];
  }) => void;
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
  edges: [],
  strokes: [],
  undoStack: [],
  redoStack: [],
  clipboard: [],
  nextZIndex: 1,

  setNodes: (nodes) => {
    // Calculate next z-index from existing nodes
    const maxZ = nodes.reduce((max, node) => {
      const z = node.zIndex ?? 0;
      return z > max ? z : max;
    }, 0);
    set({ nodes, nextZIndex: maxZ + 1 });
  },
  setEdges: (edges) => set({ edges }),

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

  applyEdgeChanges: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  addNodes: (nodes) =>
    set((state) => {
      // Assign incrementing z-index to new nodes
      const nodesWithZIndex = nodes.map((node, index) => ({
        ...node,
        zIndex: state.nextZIndex + index,
      }));
      return {
        nodes: [...state.nodes, ...nodesWithZIndex],
        nextZIndex: state.nextZIndex + nodes.length,
        ...withHistoryUpdate(state, "node_add", {
          nodes: state.nodes,
          strokes: state.strokes,
        }),
      };
    }),

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

  copyNodes: (nodeIds) =>
    set((state) => ({
      clipboard: state.nodes.filter((node) => nodeIds.includes(node.id)),
    })),

  pasteNodes: (viewportCenter) =>
    set((state) => {
      if (state.clipboard.length === 0) return state;

      const minX = Math.min(...state.clipboard.map((node) => node.position.x));
      const minY = Math.min(...state.clipboard.map((node) => node.position.y));
      const maxX = Math.max(...state.clipboard.map((node) => node.position.x));
      const maxY = Math.max(...state.clipboard.map((node) => node.position.y));

      const width = Math.max(1, maxX - minX);
      const height = Math.max(1, maxY - minY);

      const offsetX = viewportCenter.x - minX - width / 2 + 20;
      const offsetY = viewportCenter.y - minY - height / 2 + 20;

      const clonedNodes = state.clipboard.map((node, index) => {
        const newId = `${node.id}-copy-${Date.now()}-${index}`;
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + offsetX,
            y: node.position.y + offsetY,
          },
          zIndex: state.nextZIndex + index,
          data:
            typeof structuredClone === "function"
              ? structuredClone(node.data)
              : JSON.parse(JSON.stringify(node.data)),
        };
      });

      return {
        nodes: [...state.nodes, ...clonedNodes],
        nextZIndex: state.nextZIndex + clonedNodes.length,
        ...withHistoryUpdate(state, "node_add", {
          nodes: state.nodes,
          strokes: state.strokes,
        }),
      };
    }),

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

  exportCanvas: () => {
    const state = get();
    return {
      version: "1.0.0",
      nodes: cloneSnapshot({ nodes: state.nodes, strokes: [] }).nodes,
      edges: state.edges,
      strokes: cloneSnapshot({ nodes: [], strokes: state.strokes }).strokes,
    };
  },

  importCanvas: (data) => {
    const nodes = data.nodes ?? [];
    const edges = data.edges ?? [];
    const strokes = data.strokes ?? [];
    // Calculate next z-index from imported nodes
    const maxZ = nodes.reduce((max, node) => {
      const z = node.zIndex ?? 0;
      return z > max ? z : max;
    }, 0);
    set({
      nodes,
      edges,
      strokes,
      undoStack: [],
      redoStack: [],
      clipboard: [],
      nextZIndex: maxZ + 1,
    });
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
