"use client";

import { NodeToolbar } from "@xyflow/react";
import { Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadImage } from "@/lib/image-utils";
import type { ImageMetadata } from "./types";

interface ImageNodeToolbarProps {
  imageUrl: string;
  metadata: ImageMetadata;
  onExpand: () => void;
}

export function ImageNodeToolbar({
  imageUrl,
  metadata,
  onExpand,
}: ImageNodeToolbarProps) {
  const handleDownload = () => {
    downloadImage(imageUrl, metadata.name);
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
        onClick={onExpand}
        aria-label="View full screen"
        title="View full screen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </NodeToolbar>
  );
}
