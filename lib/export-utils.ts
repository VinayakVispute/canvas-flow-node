"use client";

import type { Node } from "@xyflow/react";
import type { Stroke } from "@/components/drawing-layer";
import { pointsToSmoothPath } from "@/components/drawing-layer";
import { defaultFormatting, type TextNodeData } from "@/components/text-node";

export interface ExportOptions {
  imageUrl: string;
  imagePosition: { x: number; y: number };
  imageSize: { width: number; height: number };
  originalSize: { width: number; height: number };
  strokes: Stroke[];
  nodes?: Node[];
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function getStrokesInBounds(
  strokes: Stroke[],
  bounds: Bounds,
  padding: number = 0
): Stroke[] {
  const minX = bounds.x - padding;
  const minY = bounds.y - padding;
  const maxX = bounds.x + bounds.width + padding;
  const maxY = bounds.y + bounds.height + padding;

  return strokes.filter((stroke) =>
    stroke.points.some(
      (point) =>
        point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
    )
  );
}

export async function exportImageWithDrawings(
  options: ExportOptions
): Promise<Blob | null> {
  const {
    imageUrl,
    imagePosition,
    imageSize,
    originalSize,
    strokes,
    nodes = [],
  } = options;

  if (imageSize.width <= 0 || imageSize.height <= 0) return null;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(originalSize.width));
  canvas.height = Math.max(1, Math.floor(originalSize.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try {
    const img = await loadImage(imageUrl);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  } catch {
    return null;
  }

  const scaleX = canvas.width / imageSize.width;
  const scaleY = canvas.height / imageSize.height;
  const strokeScale = (scaleX + scaleY) / 2;

  const maxStrokeWidth = strokes.reduce(
    (max, stroke) => Math.max(max, stroke.width),
    0
  );
  const padding = maxStrokeWidth / 2;

  const inBoundsStrokes = getStrokesInBounds(
    strokes,
    {
      x: imagePosition.x,
      y: imagePosition.y,
      width: imageSize.width,
      height: imageSize.height,
    },
    padding
  );

  if (inBoundsStrokes.length > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.clip();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    inBoundsStrokes.forEach((stroke) => {
      const transformedPoints = stroke.points.map((point) => ({
        x: (point.x - imagePosition.x) * scaleX,
        y: (point.y - imagePosition.y) * scaleY,
      }));

      const pathData = pointsToSmoothPath(transformedPoints);
      if (!pathData) return;

      const path = new Path2D(pathData);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(1, stroke.width * strokeScale);
      ctx.stroke(path);
    });

    ctx.restore();
  }

  if (nodes.length > 0) {
    const textNodes = nodes.filter((node) => node.type === "text");
    if (textNodes.length > 0) {
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      textNodes.forEach((node) => {
        const data = node.data as TextNodeData;
        const formatting = data.formatting ?? defaultFormatting;
        const text = data.text ?? "";
        if (!text) return;

        const fontSize = Math.max(1, formatting.fontSize * strokeScale);
        const fontWeight = formatting.bold ? "bold" : "normal";
        const fontStyle = formatting.italic ? "italic" : "normal";
        const fontFamily = formatting.fontFamily || defaultFormatting.fontFamily;

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = formatting.color || defaultFormatting.color;

        const metrics = ctx.measureText(text);
        const textWidth = metrics.width / strokeScale;
        const textHeight = formatting.fontSize * 1.2;

        const nodeRect: Rect = {
          x: node.position.x,
          y: node.position.y,
          width: textWidth,
          height: textHeight,
        };

        const boundsRect: Rect = {
          x: imagePosition.x,
          y: imagePosition.y,
          width: imageSize.width,
          height: imageSize.height,
        };

        const intersects =
          nodeRect.x < boundsRect.x + boundsRect.width &&
          nodeRect.x + nodeRect.width > boundsRect.x &&
          nodeRect.y < boundsRect.y + boundsRect.height &&
          nodeRect.y + nodeRect.height > boundsRect.y;

        if (!intersects) return;

        const drawX = (node.position.x - imagePosition.x) * scaleX;
        const drawY = (node.position.y - imagePosition.y) * scaleY;
        ctx.fillText(text, drawX, drawY);
      });

      ctx.restore();
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

export function getExportFilename(originalName?: string): string {
  const base = originalName || `image-${Date.now()}`;
  const dotIndex = base.lastIndexOf(".");
  if (dotIndex === -1) {
    return `${base}-drawing.png`;
  }

  const name = base.slice(0, dotIndex);
  return `${name}-drawing.png`;
}
