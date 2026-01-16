"use client";

import { memo, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import { ImageNodeToolbar } from "./ImageNodeToolbar";
import { FullScreenView } from "./FullScreenView";
import type { ImageNodeData } from "./types";

interface ImageNodeComponentProps {
  data: ImageNodeData;
  selected?: boolean;
}

function ImageNodeComponent({ data, selected }: ImageNodeComponentProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

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
