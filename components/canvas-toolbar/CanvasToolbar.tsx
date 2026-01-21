"use client";

import { useRef } from "react";
import { FileDown, FileUp, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrawingControls } from "@/components/drawing-controls";
import { CursorModeToggle } from "./CursorModeToggle";
import type { CursorMode } from "@/components/drawing-layer";

interface CanvasToolbarProps {
  onAddText: () => void;
  onAddVideo: () => void;
  onAddForm: () => void;
  onExportSelected?: () => void;
  selectedImageCount?: number;
  cursorMode: CursorMode;
  isSpaceHeld?: boolean;
  isDrawingMode: boolean;
  onToggleCursorMode: () => void;
  onExportCanvas: () => void;
  onImportCanvas: (file: File) => void;
}

export function CanvasToolbar({
  onAddText,
  onAddVideo,
  onAddForm,
  onExportSelected,
  selectedImageCount = 0,
  cursorMode,
  isSpaceHeld = false,
  isDrawingMode,
  onToggleCursorMode,
  onExportCanvas,
  onImportCanvas,
}: CanvasToolbarProps) {
  const hasSelection = selectedImageCount > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportCanvas(file);
    }
    event.target.value = "";
  };

  return (
    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg border bg-background p-2 shadow-md">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddText}
        className="flex items-center gap-2 transition-colors"
        aria-label="Add text to canvas"
        title="Add Text"
      >
        <Type className="h-4 w-4" />
        <span>Add Text</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddVideo}
        className="flex items-center gap-2 transition-colors"
        aria-label="Add video to canvas"
        title="Add Video"
      >
        <span>Add Video</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddForm}
        className="flex items-center gap-2 transition-colors"
        aria-label="Add form to canvas"
        title="Add Form"
      >
        <span>Add Form</span>
      </Button>

      <CursorModeToggle
        mode={cursorMode}
        isSpaceHeld={isSpaceHeld}
        disabled={isDrawingMode}
        onToggle={onToggleCursorMode}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={onExportCanvas}
        className="flex items-center gap-2 transition-colors"
        aria-label="Export canvas"
        title="Export Canvas"
      >
        <FileDown className="h-4 w-4" />
        <span>Export Canvas</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        className="flex items-center gap-2 transition-colors"
        aria-label="Import canvas"
        title="Import Canvas"
      >
        <FileUp className="h-4 w-4" />
        <span>Import Canvas</span>
      </Button>

      {hasSelection && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExportSelected}
          className="flex items-center gap-2 transition-colors"
          aria-label="Export selected images with drawings"
          title="Export Selected"
        >
          <FileDown className="h-4 w-4" />
          <span>Export Selected</span>
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <Separator orientation="vertical" className="h-6" />

      {/* Drawing Controls */}
      <DrawingControls />
    </div>
  );
}
