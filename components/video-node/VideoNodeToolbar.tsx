"use client";

import { NodeToolbar } from "@xyflow/react";
import { Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadVideo } from "@/lib/video-utils";
import type { VideoMetadata } from "./types";

interface VideoNodeToolbarProps {
  videoUrl: string;
  metadata: VideoMetadata;
  onExpand: () => void;
}

export function VideoNodeToolbar({
  videoUrl,
  metadata,
  onExpand,
}: VideoNodeToolbarProps) {
  const handleDownload = () => {
    downloadVideo(videoUrl, metadata.name);
  };

  return (
    <NodeToolbar className="flex gap-1 rounded-md border bg-background p-1 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 transition-colors"
        onClick={handleDownload}
        aria-label="Download video"
        title="Download video"
      >
        <Download className="h-4 w-4" />
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
