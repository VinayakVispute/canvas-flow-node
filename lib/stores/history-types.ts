import type { Node } from "@xyflow/react";
import type { Stroke } from "@/components/drawing-layer";

export type HistoryActionType =
  | "node_add"
  | "node_delete"
  | "node_move"
  | "node_resize"
  | "stroke_add"
  | "stroke_delete"
  | "stroke_move"
  | "stroke_clear"
  | "batch";

export interface CanvasSnapshot {
  nodes: Node[];
  strokes: Stroke[];
}

export interface HistoryEntry {
  type: HistoryActionType;
  timestamp: number;
  snapshot: CanvasSnapshot;
}
