import type { Node } from "@xyflow/react";

export interface VideoMetadata {
  name: string;
  url: string;
  width: number;
  height: number;
  duration: number;
  format: string;
  timestamp: string;
  fileSize?: number;
  [key: string]: unknown;
}

export interface VideoNodeData {
  videoUrl: string;
  metadata: VideoMetadata;
  [key: string]: unknown;
}

export type VideoNodeType = Node<VideoNodeData, "video">;

export interface FullScreenViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  metadata: VideoMetadata;
}
