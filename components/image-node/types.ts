import type { Node } from "@xyflow/react";

export interface ImageMetadata {
  name: string;
  url: string;
  width: number;
  height: number;
  format: string;
  timestamp: string;
  fileSize?: number;
  [key: string]: unknown;
}

export interface ImageNodeData {
  imageUrl: string;
  metadata: ImageMetadata;
  [key: string]: unknown;
}

export type ImageNodeType = Node<ImageNodeData, "image">;

export interface FullScreenViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  metadata: ImageMetadata;
}
