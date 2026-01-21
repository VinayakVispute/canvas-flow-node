"use client";

import { NodeToolbar, useReactFlow, useInternalNode } from "@xyflow/react";
import { Download, FileDown, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadImage } from "@/lib/image-utils";
import {
  downloadBlob,
  exportImageWithDrawings,
  getExportFilename,
} from "@/lib/export-utils";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { ImageMetadata } from "./types";

interface ImageNodeToolbarProps {
  imageUrl: string;
  metadata: ImageMetadata;
  nodeId: string;
  nodePosition: { x: number; y: number };
  nodeSize: { width: number; height: number };
  onExpand: () => void;
}

export function ImageNodeToolbar({
  imageUrl,
  metadata,
  nodeId,
  nodePosition,
  nodeSize,
  onExpand,
}: ImageNodeToolbarProps) {
  const { strokes, nodes } = useCanvasStore();
  const { getNode } = useReactFlow();
  const internalNode = useInternalNode(nodeId);

  const resolveNodeSize = (size: { width: number; height: number }) => {
    if (size.width > 0 && size.height > 0) return size;
    return { width: metadata.width, height: metadata.height };
  };

  const resolveLiveNodePosition = () => {
    const node = getNode(nodeId);
    return (
      internalNode?.internals.positionAbsolute ??
      node?.position ??
      nodePosition ?? {
        x: 0,
        y: 0,
      }
    );
  };

  const resolveLiveNodeSize = () => {
    const node = getNode(nodeId);
    const width =
      typeof node?.width === "number"
        ? node.width
        : typeof node?.style?.width === "number"
        ? node.style.width
        : Number.parseFloat(String(node?.style?.width || ""));
    const height =
      typeof node?.height === "number"
        ? node.height
        : typeof node?.style?.height === "number"
        ? node.style.height
        : Number.parseFloat(String(node?.style?.height || ""));

    return resolveNodeSize({
      width: Number.isFinite(width) ? width : nodeSize.width,
      height: Number.isFinite(height) ? height : nodeSize.height,
    });
  };

  const handleDownload = () => {
    downloadImage(imageUrl, metadata.name);
  };

  const handleExportWithDrawing = async () => {
    const safePosition = resolveLiveNodePosition();
    const safeSize = resolveLiveNodeSize();

    const blob = await exportImageWithDrawings({
      imageUrl,
      imagePosition: safePosition,
      imageSize: safeSize,
      originalSize: { width: metadata.width, height: metadata.height },
      strokes,
      nodes,
    });

    if (blob) {
      downloadBlob(blob, getExportFilename(metadata.name));
    }
  };

  return (
    <NodeToolbar className="flex gap-1 rounded-md border bg-background p-1 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 transition-colors"
        onClick={handleDownload}
        aria-label="Download image"
        title="Download image"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 transition-colors"
        onClick={handleExportWithDrawing}
        aria-label="Export image with drawing"
        title="Export with drawing"
        disabled={
          resolveLiveNodeSize().width <= 0 || resolveLiveNodeSize().height <= 0
        }
      >
        <FileDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 transition-colors"
        onClick={onExpand}
        aria-label="View full screen"
        title="View full screen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </NodeToolbar>
  );
}
