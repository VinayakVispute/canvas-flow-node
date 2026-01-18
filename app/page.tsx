"use client";

import { useState, useCallback, useRef, useEffect, DragEvent } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  type NodeChange,
  type Node,
  type NodeTypes,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ImageNode,
  type ImageNodeData,
  type ImageNodeType,
} from "@/components/image-node";
import {
  TextNode,
  type TextNodeData,
  defaultFormatting,
} from "@/components/text-node";
import { CanvasToolbar } from "@/components/canvas-toolbar";
import { DrawingLayer, useDrawingStore } from "@/components/drawing-layer";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { CanvasSnapshot } from "@/lib/stores/history-types";
import { extractImageMetadata, fileToBase64 } from "@/lib/image-utils";
import {
  downloadBlob,
  exportImageWithDrawings,
  getExportFilename,
} from "@/lib/export-utils";

const DEFAULT_IMAGE_URL =
  "https://d2weamipq0hk4d.cloudfront.net/assets/asset_1762153343464.webp";

const nodeTypes: NodeTypes = {
  image: ImageNode,
  text: TextNode,
};

function FlowCanvas() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedImageNodes, setSelectedImageNodes] = useState<ImageNodeType[]>(
    []
  );
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, getNode } = useReactFlow();
  const dragStartSnapshot = useRef<CanvasSnapshot | null>(null);
  const resizeStartSnapshot = useRef<CanvasSnapshot | null>(null);
  const isResizing = useRef(false);

  const {
    nodes,
    setNodes,
    applyNodeChanges,
    addNodes,
    getSnapshot,
    pushHistory,
    undo,
    redo,
    strokes,
  } = useCanvasStore();

  // Drawing state
  const {
    isDrawingMode,
    layerPosition,
    cursorMode,
    isSpaceHeld,
    setCursorMode,
    setSpaceHeld,
    selectedStrokeIds,
    deleteSelectedStrokes,
    deselectAllStrokes,
  } = useDrawingStore();

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
  }, [setNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const hasResize = changes.some((change) => change.type === "dimensions");
      if (hasResize && !isResizing.current) {
        resizeStartSnapshot.current = getSnapshot();
        isResizing.current = true;
      }
      applyNodeChanges(changes);
    },
    [applyNodeChanges, getSnapshot]
  );

  const onNodeDragStart = useCallback(() => {
    dragStartSnapshot.current = getSnapshot();
  }, [getSnapshot]);

  const onNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      if (!dragStartSnapshot.current) return;

      const previousNode = dragStartSnapshot.current.nodes.find(
        (prevNode) => prevNode.id === node.id
      );
      const positionChanged =
        !previousNode ||
        previousNode.position.x !== node.position.x ||
        previousNode.position.y !== node.position.y;

      if (positionChanged) {
        pushHistory("node_move", dragStartSnapshot.current);
      }

      dragStartSnapshot.current = null;
    },
    [pushHistory]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      const imageNodes = selectedNodes.filter(
        (node) => node.type === "image"
      ) as ImageNodeType[];
      setSelectedImageNodes(imageNodes);
    },
    []
  );

  // Keyboard shortcuts for drawing undo/redo (works in both drawing and pointer mode)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if typing in an input or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

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
  }, [undo, redo]);

  // Capture resize end to push history once
  useEffect(() => {
    const handlePointerUp = () => {
      if (isResizing.current && resizeStartSnapshot.current) {
        pushHistory("node_resize", resizeStartSnapshot.current);
      }
      isResizing.current = false;
      resizeStartSnapshot.current = null;
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [pushHistory]);

  // Space bar for temporary grab mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if typing in an input or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        setSpaceHeld(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setSpaceHeld(false);
      }
    };

    // Also release space on window blur (e.g., switching tabs)
    const handleBlur = () => {
      setSpaceHeld(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [setSpaceHeld]);

  // Delete selected strokes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedStrokeIds.length > 0) {
          event.preventDefault();
          deleteSelectedStrokes();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStrokeIds, deleteSelectedStrokes]);

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

    addNodes([newNode]);
  }, [addNodes]);

  const resolveNodeSize = (node: ImageNodeType) => {
    const width =
      typeof node.width === "number"
        ? node.width
        : typeof node.style?.width === "number"
        ? node.style.width
        : Number.parseFloat(String(node.style?.width || ""));
    const height =
      typeof node.height === "number"
        ? node.height
        : typeof node.style?.height === "number"
        ? node.style.height
        : Number.parseFloat(String(node.style?.height || ""));

    return {
      width: Number.isFinite(width) ? width : node.data.metadata.width,
      height: Number.isFinite(height) ? height : node.data.metadata.height,
    };
  };

  const handleExportSelected = useCallback(async () => {
    if (selectedImageNodes.length === 0) return;

    for (const node of selectedImageNodes) {
      const liveNode = getNode(node.id);
      const nodePosition = liveNode?.position ??
        node.position ?? { x: 0, y: 0 };
      const nodeSize = resolveNodeSize(node);

      const blob = await exportImageWithDrawings({
        imageUrl: node.data.imageUrl,
        imagePosition: nodePosition,
        imageSize: nodeSize,
        originalSize: {
          width: node.data.metadata.width,
          height: node.data.metadata.height,
        },
        strokes,
      });

      if (blob) {
        downloadBlob(blob, getExportFilename(node.data.metadata.name));
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }, [selectedImageNodes, strokes, getNode]);

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

      const newNodes: Node<ImageNodeData>[] = [];

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

          newNodes.push(newNode);
        } catch (error) {
          console.error("Failed to process dropped image:", error);
        }
      }

      if (newNodes.length > 0) {
        addNodes(newNodes);
      }
    },
    [screenToFlowPosition, addNodes]
  );

  const effectiveMode = isSpaceHeld ? "grab" : cursorMode;

  const handleToggleCursorMode = useCallback(() => {
    setCursorMode(cursorMode === "pointer" ? "grab" : "pointer");
  }, [cursorMode, setCursorMode]);

  // Deselect strokes when clicking on empty canvas area
  const handlePaneClick = useCallback(() => {
    if (selectedStrokeIds.length > 0) {
      deselectAllStrokes();
    }
  }, [selectedStrokeIds, deselectAllStrokes]);

  // Determine wrapper cursor based on current mode
  const wrapperCursor = isDrawingMode
    ? "crosshair"
    : effectiveMode === "grab"
    ? "grab"
    : "default";

  return (
    <div
      ref={reactFlowWrapper}
      className="relative h-screen w-screen"
      style={{ cursor: wrapperCursor }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Canvas Toolbar */}
      <CanvasToolbar
        onAddText={handleAddText}
        onExportSelected={handleExportSelected}
        selectedImageCount={selectedImageNodes.length}
        cursorMode={cursorMode}
        isSpaceHeld={isSpaceHeld}
        isDrawingMode={isDrawingMode}
        onToggleCursorMode={handleToggleCursorMode}
      />

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
        onSelectionChange={onSelectionChange}
        onPaneClick={handlePaneClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        proOptions={{ hideAttribution: true }}
        // Disable pan and selection when in drawing mode
        panOnDrag={effectiveMode === "grab" || isDrawingMode}
        selectionOnDrag={effectiveMode === "pointer" && !isDrawingMode}
        // Prevent node dragging when in drawing mode
        nodesDraggable={effectiveMode === "pointer" && !isDrawingMode}
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
