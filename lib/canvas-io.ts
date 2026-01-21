import type { Edge, Node } from "@xyflow/react";
import type { Stroke } from "@/components/drawing-layer";

export interface CanvasExportData {
  version: string;
  nodes: Node[];
  edges: Edge[];
  strokes: Stroke[];
}

export function downloadCanvasJSON(data: CanvasExportData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `canvas-export-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

export async function parseCanvasJSON(file: File): Promise<CanvasExportData> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid canvas file.");
  }

  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Canvas file is missing nodes or edges.");
  }

  return {
    version: typeof parsed.version === "string" ? parsed.version : "1.0.0",
    nodes: parsed.nodes,
    edges: parsed.edges,
    strokes: Array.isArray(parsed.strokes) ? parsed.strokes : [],
  };
}
