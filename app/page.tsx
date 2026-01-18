"use client";

import { useState, useCallback, useRef, useEffect, DragEvent } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  type NodeChange,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ImageNode, type ImageNodeData } from "@/components/image-node";
import {
  TextNode,
  type TextNodeData,
  defaultFormatting,
} from "@/components/text-node";
import { CanvasToolbar } from "@/components/canvas-toolbar";
import { DrawingLayer, useDrawingStore } from "@/components/drawing-layer";
import { extractImageMetadata, fileToBase64 } from "@/lib/image-utils";

const DEFAULT_IMAGE_URL =
  "https://d2weamipq0hk4d.cloudfront.net/assets/asset_1762153343464.webp";

const nodeTypes: NodeTypes = {
  image: ImageNode,
  text: TextNode,
};

function FlowCanvas() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Drawing state
  const { isDrawingMode, layerPosition, undo, redo } = useDrawingStore();

  // Initialize with default image node
  useEffect(() => {
    const initializeDefaultNode = async () => {
      try {
        const metadata = await extractImageMetadata(DEFAULT_IMAGE_URL);

        // Calculate initial size (max 400px while maintaining aspect ratio)
        const maxSize = 400;
        let width = metadata.width;
        let height = metadata.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        const initialNode: Node<ImageNodeData> = {
          id: "image-1",
          type: "image",
          position: { x: 100, y: 100 },
          data: {
            imageUrl: DEFAULT_IMAGE_URL,
            metadata,
          },
          style: {
            width,
            height,
          },
        };

        setNodes([initialNode]);
      } catch (error) {
        console.error("Failed to initialize default node:", error);
      }
    };

    initializeDefaultNode();
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Keyboard shortcuts for drawing undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when in drawing mode
      if (!isDrawingMode) return;

      // Check for Ctrl/Cmd + Z (Undo) or Ctrl/Cmd + Shift + Z (Redo)
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (modifierKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      // Also support Ctrl/Cmd + Y for Redo (Windows convention)
      if (modifierKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawingMode, undo, redo]);

  const handleAddText = useCallback(() => {
    const newNode: Node<TextNodeData> = {
      id: `text-${Date.now()}`,
      type: "text",
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100,
      },
      data: {
        text: "Double-click to edit",
        formatting: { ...defaultFormatting },
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";

    // Check if dragging files
    if (event.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  }, []);

  const onDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    // Only set to false if leaving the container
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDraggingOver(false);
    }
  }, []);

  const onDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(false);

      const files = event.dataTransfer.files;
      if (files.length === 0) return;

      // Filter for image files only
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length === 0) return;

      // Get drop position
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Process each dropped image
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        try {
          const base64Url = await fileToBase64(file);
          const metadata = await extractImageMetadata(base64Url, file.size);

          // Update metadata with original filename
          metadata.name = file.name;

          // Calculate initial size (max 400px while maintaining aspect ratio)
          const maxSize = 400;
          let width = metadata.width;
          let height = metadata.height;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          const newNode: Node<ImageNodeData> = {
            id: `image-${Date.now()}-${i}`,
            type: "image",
            position: {
              x: position.x + i * 20,
              y: position.y + i * 20,
            },
            data: {
              imageUrl: base64Url,
              metadata,
            },
            style: {
              width,
              height,
            },
          };

          setNodes((nds) => [...nds, newNode]);
        } catch (error) {
          console.error("Failed to process dropped image:", error);
        }
      }
    },
    [screenToFlowPosition]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="relative h-screen w-screen"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Canvas Toolbar */}
      <CanvasToolbar onAddText={handleAddText} />

      {/* Drop Zone Overlay */}
      {isDraggingOver && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
          <div className="rounded-lg border-2 border-dashed border-primary bg-background/80 p-8 text-center shadow-lg">
            <p className="text-lg font-medium text-primary">
              Drop image here to add to canvas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports PNG, JPG, GIF, WEBP
            </p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        proOptions={{ hideAttribution: true }}
        // Disable pan and selection when in drawing mode
        panOnDrag={!isDrawingMode}
        selectionOnDrag={!isDrawingMode}
        // Prevent node dragging when in drawing mode
        nodesDraggable={!isDrawingMode}
      >
        <Background />
        <DrawingLayer position={layerPosition} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
