"use client";

import { memo, useState } from "react";
import { NodeResizer, type NodeProps, useInternalNode } from "@xyflow/react";
import { VideoNodeToolbar } from "./VideoNodeToolbar";
import { FullScreenView } from "./FullScreenView";
import type { VideoNodeType } from "./types";

type VideoNodeComponentProps = NodeProps<VideoNodeType>;

function normalizeSize(value?: number | string): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function VideoNodeComponent({ data, selected, id }: VideoNodeComponentProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const internalNode = useInternalNode(id);
  const displayWidth =
    normalizeSize(internalNode?.width) ?? data.metadata.width;
  const displayHeight =
    normalizeSize(internalNode?.height) ?? data.metadata.height;

  return (
    <>
      <NodeResizer
        keepAspectRatio
        isVisible={selected}
        minWidth={120}
        minHeight={90}
        lineClassName="border-primary"
        handleClassName="h-3 w-3 rounded-sm border-2 border-primary bg-background"
      />

      <VideoNodeToolbar
        videoUrl={data.videoUrl}
        metadata={data.metadata}
        onExpand={() => setIsFullScreen(true)}
      />

      <div className="h-full w-full overflow-hidden rounded-lg border bg-muted/20 shadow-sm">
        <video
          src={data.videoUrl}
          controls
          muted
          className="h-full w-full object-contain"
          width={displayWidth}
          height={displayHeight}
        />
      </div>

      <FullScreenView
        open={isFullScreen}
        onOpenChange={setIsFullScreen}
        videoUrl={data.videoUrl}
        metadata={data.metadata}
      />
    </>
  );
}

export const VideoNode = memo(VideoNodeComponent);
