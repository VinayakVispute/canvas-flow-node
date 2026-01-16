import type { ImageMetadata } from "@/components/image-node/types";

/**
 * Get image dimensions by loading the image
 */
export function getImageDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Extract format from URL or data URL
 */
export function getImageFormat(url: string): string {
  // Check if it's a data URL
  if (url.startsWith("data:")) {
    const match = url.match(/data:image\/([^;]+)/);
    return match ? match[1].toUpperCase() : "UNKNOWN";
  }

  // Extract extension from URL
  const urlWithoutQuery = url.split("?")[0];
  const extension = urlWithoutQuery.split(".").pop()?.toLowerCase();

  const formatMap: Record<string, string> = {
    jpg: "JPEG",
    jpeg: "JPEG",
    png: "PNG",
    gif: "GIF",
    webp: "WEBP",
    svg: "SVG",
    bmp: "BMP",
    ico: "ICO",
  };

  return formatMap[extension || ""] || "UNKNOWN";
}

/**
 * Extract filename from URL
 */
export function getImageName(url: string): string {
  if (url.startsWith("data:")) {
    return `image-${Date.now()}`;
  }

  const urlWithoutQuery = url.split("?")[0];
  const filename = urlWithoutQuery.split("/").pop();
  return filename || `image-${Date.now()}`;
}

/**
 * Convert File to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Extract complete metadata from an image URL
 */
export async function extractImageMetadata(
  url: string,
  fileSize?: number
): Promise<ImageMetadata> {
  const dimensions = await getImageDimensions(url);

  return {
    name: getImageName(url),
    url: url,
    width: dimensions.width,
    height: dimensions.height,
    format: getImageFormat(url),
    timestamp: new Date().toISOString(),
    fileSize: fileSize,
  };
}

/**
 * Download an image
 */
export async function downloadImage(
  url: string,
  filename?: string
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || getImageName(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback for CORS issues - open in new tab
    window.open(url, "_blank");
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}
