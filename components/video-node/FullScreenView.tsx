"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  X,
  Link,
  Ruler,
  FileType,
  Calendar,
  HardDrive,
  Clock,
  Video,
} from "lucide-react";
import { downloadVideo } from "@/lib/video-utils";
import { formatFileSize, formatTimestamp } from "@/lib/image-utils";
import type { FullScreenViewProps } from "./types";

export function FullScreenView({
  open,
  onOpenChange,
  videoUrl,
  metadata,
}: FullScreenViewProps) {
  const handleDownload = () => {
    downloadVideo(videoUrl, metadata.name);
  };

  const formatDuration = (duration: number) => {
    if (!duration || duration <= 0) return "Unknown";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton className="flex h-[90vh] max-w-[95vw] gap-0 p-0">
        {/* Video Preview Area */}
        <div className="relative flex flex-1 items-center justify-center bg-black/95 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 text-white hover:bg-white/20 transition-colors"
            onClick={() => onOpenChange(false)}
            aria-label="Close full screen view"
          >
            <X className="h-5 w-5" />
          </Button>
          <video
            src={videoUrl}
            controls
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Sidebar */}
        <div className="flex w-80 flex-col border-l bg-background">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <DialogTitle className="text-lg font-semibold">
              Video Details
            </DialogTitle>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-b p-4">
            <Button
              onClick={handleDownload}
              className="flex-1 transition-colors"
              aria-label="Download video"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled
              aria-label="Share video (coming soon)"
              title="Coming soon"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Metadata */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
              Metadata
            </h3>

            <div className="space-y-4">
              <MetadataItem
                icon={<Video className="h-4 w-4" />}
                label="Name"
                value={metadata.name}
              />

              <MetadataItem
                icon={<Link className="h-4 w-4" />}
                label="URL"
                value={
                  metadata.url.startsWith("data:")
                    ? "Local video (base64)"
                    : metadata.url
                }
                truncate
              />

              <MetadataItem
                icon={<Ruler className="h-4 w-4" />}
                label="Dimensions"
                value={`${metadata.width} × ${metadata.height} px`}
              />

              <MetadataItem
                icon={<Clock className="h-4 w-4" />}
                label="Duration"
                value={formatDuration(metadata.duration)}
              />

              <MetadataItem
                icon={<FileType className="h-4 w-4" />}
                label="Format"
                value={metadata.format}
              />

              <MetadataItem
                icon={<Calendar className="h-4 w-4" />}
                label="Added"
                value={formatTimestamp(metadata.timestamp)}
              />

              {metadata.fileSize && (
                <MetadataItem
                  icon={<HardDrive className="h-4 w-4" />}
                  label="File Size"
                  value={formatFileSize(metadata.fileSize)}
                />
              )}
            </div>
          </div>

          {/* Hidden description for accessibility */}
          <DialogDescription className="sr-only">
            Full screen view of {metadata.name} with video details and actions
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MetadataItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  truncate?: boolean;
}

function MetadataItem({ icon, label, value, truncate }: MetadataItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm font-medium ${truncate ? "truncate" : ""}`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
