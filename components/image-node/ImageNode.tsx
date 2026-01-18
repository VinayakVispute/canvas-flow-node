"use client";

import { memo, useState } from "react";
import { NodeResizer, type NodeProps, useInternalNode } from "@xyflow/react";
import { ImageNodeToolbar } from "./ImageNodeToolbar";
import { FullScreenView } from "./FullScreenView";
import type { ImageNodeData, ImageNodeType } from "./types";

type ImageNodeComponentProps = NodeProps<ImageNodeType>;

function normalizeSize(value?: number | string): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function ImageNodeComponent({ data, selected, id }: ImageNodeComponentProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const internalNode = useInternalNode(id);
  const nodePosition = internalNode?.internals.positionAbsolute ?? {
    x: 0,
    y: 0,
  };
  const displayWidth =
    normalizeSize(internalNode?.width) ?? data.metadata.width;
  const displayHeight =
    normalizeSize(internalNode?.height) ?? data.metadata.height;

  return (
    <>
      <NodeResizer
        keepAspectRatio
        isVisible={selected}
        minWidth={50}
        minHeight={50}
        lineClassName="border-primary"
        handleClassName="h-3 w-3 rounded-sm border-2 border-primary bg-background"
      />

      <ImageNodeToolbar
        imageUrl={data.imageUrl}
        metadata={data.metadata}
        nodeId={id}
        nodePosition={nodePosition}
        nodeSize={{ width: displayWidth, height: displayHeight }}
        onExpand={() => setIsFullScreen(true)}
      />

      <div className="h-full w-full overflow-hidden rounded-lg border bg-muted/20 shadow-sm">
        <img
          src={data.imageUrl}
          alt={data.metadata.name}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>

      <FullScreenView
        open={isFullScreen}
        onOpenChange={setIsFullScreen}
        imageUrl={data.imageUrl}
        metadata={data.metadata}
      />
    </>
  );
}

export const ImageNode = memo(ImageNodeComponent);
