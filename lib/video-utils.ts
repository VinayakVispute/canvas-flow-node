import type { VideoMetadata } from "@/components/video-node/types";

export function getVideoFormat(url: string): string {
  if (url.startsWith("data:")) {
    const match = url.match(/data:video\/([^;]+)/);
    return match ? match[1].toUpperCase() : "UNKNOWN";
  }

  const urlWithoutQuery = url.split("?")[0];
  const extension = urlWithoutQuery.split(".").pop()?.toLowerCase();

  const formatMap: Record<string, string> = {
    mp4: "MP4",
    webm: "WEBM",
    ogg: "OGG",
    mov: "MOV",
    m4v: "M4V",
  };

  return formatMap[extension || ""] || "UNKNOWN";
}

export function getVideoName(url: string): string {
  if (url.startsWith("data:")) {
    return `video-${Date.now()}`;
  }

  const urlWithoutQuery = url.split("?")[0];
  const filename = urlWithoutQuery.split("/").pop();
  return filename || `video-${Date.now()}`;
}

export async function extractVideoMetadata(
  url: string,
  fileSize?: number
): Promise<VideoMetadata> {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.src = url;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load video"));
  });

  return {
    name: getVideoName(url),
    url,
    width: video.videoWidth || 640,
    height: video.videoHeight || 360,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    format: getVideoFormat(url),
    timestamp: new Date().toISOString(),
    fileSize,
  };
}

export async function downloadVideo(
  url: string,
  filename?: string
): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || getVideoName(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}
