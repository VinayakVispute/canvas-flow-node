Here is the **final, complete, and locked requirements document**, with the **Rotation section correctly rewritten and integrated**.
No placeholders, no pending decisions — this is the **authoritative final version**.

---

# Image Node – Final Requirements Specification (React Flow)

## Overview

The Image Node is a custom **React Flow node** designed exclusively for displaying images.
It supports aspect-ratio–preserving resizing, metadata extraction, full-screen preview with sidebar actions, and drag-and-drop image creation.

This document is **final** and serves as the authoritative reference for implementation.

---

## 1. Image Rendering

- The Image Node must render **images only**.
- Initially, the node will use a **default image URL** provided by the system.
- The image must render inside the node without distortion.
- The node's initial size must be derived from the image's **original aspect ratio**.

---

## 2. Aspect Ratio Behavior

- The image's **original aspect ratio must always be preserved**.
- Resizing from **any direction** (top, bottom, left, right, or corners) must scale proportionally.
- Aspect ratio locking is mandatory and cannot be disabled.

---

## 3. Node Resizing

- The Image Node must support **manual resizing only**.
- No minimum or maximum size constraints are required.
- Resizing must work smoothly regardless of current rotation state.

---

## 4. Rotation [DEFERRED]

> **Implementation Status**: Rotation is deferred for future implementation.

- The Image Node must support **free-form rotation**.
- Rotation must be controlled via a **dedicated rotation handle** positioned outside the node's bounding box, aligned centrally above the image.
- The rotation handle must:

  - Be draggable.
  - Allow continuous, unrestricted rotation (not step-based).

- Rotation must remain fully compatible with resizing and aspect-ratio preservation.
- The current rotation angle must be stored as part of the node's data model.

---

## 5. Connectors / Edges

- The Image Node must **not support connectors or edges**.
- No handles for incoming or outgoing connections should exist.

---

## 6. Mini Toolbar

Each Image Node must display a **mini toolbar** when hovered or selected.

### Toolbar Actions

- **Download**

  - Downloads the image locally.

- **Expand**

  - Opens the image in full-screen mode.

---

## 7. Full-Screen Image View

- Expanding an image must open a **full-screen overlay**.
- While full screen is active:

  - The React Flow canvas must not be visible.
  - All canvas interactions must be **locked/disabled**.

- The full-screen view must include:

  - The image rendered at optimal resolution.
  - A sidebar panel for metadata and actions.

---

## 8. Sidebar (Full-Screen Mode)

The sidebar must present **image actions and extracted metadata**.

### Sidebar Actions

- **Download**
- **Share** [DEFERRED]

  - Copies the image URL to the clipboard.
  - Currently disabled pending upload endpoint implementation.

### Sidebar Metadata

Metadata must be **automatically extracted** and displayed.

Metadata includes (when available):

- Image name
- Image URL
- Image dimensions (width × height)
- File format/type
- Timestamp (derived at load or node creation time)
- File size (if accessible)

---

## 9. Image Metadata Management

- Metadata must be extracted programmatically from the image source.
- Extracted metadata must:

  - Be stored in the node's data model.
  - Be displayed in the full-screen sidebar.

- Metadata is read-only at this stage.

---

## 10. Drag-and-Drop Image Support

- Users must be able to **drag and drop images onto the canvas** to create an Image Node.
- When an image is dragged over the canvas:

  - A **visual overlay or highlight** must appear.
  - The effect must clearly communicate that drag-and-drop is active.

- On drop:

  - A new Image Node must be created at the drop position.
  - The dropped image must replace the default image URL.

---

## Non-Functional Scope

- The Image Node must integrate cleanly with React Flow's node lifecycle.
- Performance must remain stable with multiple Image Nodes present.
- State persistence across sessions is **explicitly out of scope**.

The implementation must follow a modular and scalable architecture, adhering to established best practices for React.js and Next.js. Components should be designed with clear separation of concerns, favoring composability, reusability, and maintainability. State management should be predictable and localized where possible, with side effects handled explicitly. The codebase should leverage idiomatic React patterns, functional components, and hooks, while aligning with Next.js conventions for performance, rendering, and structure. All logic, UI, and utilities should be organized into well-defined modules to ensure readability, testability, and long-term maintainability.

Follow this Url for React Flow: https://reactflow.dev/docs/introduction

---

## Implementation Notes

### Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Image Rendering | Implemented | Default URL: `https://d2weamipq0hk4d.cloudfront.net/assets/asset_1762153343464.webp` |
| Aspect Ratio Preservation | Implemented | Using `NodeResizer` with `keepAspectRatio={true}` |
| Node Resizing | Implemented | Manual resize from all directions |
| Rotation | Deferred | Planned for future release |
| No Connectors/Edges | Implemented | No Handle components rendered |
| Mini Toolbar | Implemented | Download and Expand buttons |
| Full-Screen View | Implemented | Dialog-based overlay with right sidebar |
| Sidebar Actions | Partial | Download works, Share disabled |
| Metadata Display | Implemented | Name, URL, dimensions, format, timestamp, file size |
| Drag-and-Drop | Implemented | Dropped images stored as base64 data URLs |

### Technical Decisions

1. **Image Storage**: Dropped images are converted to base64 data URLs and stored in node data. An upload endpoint will be implemented later to replace this with cloud storage.

2. **Share Button**: Currently disabled with "Coming soon" tooltip. Will be enabled once upload endpoint is available to generate shareable URLs.

3. **UI Components**: Built with shadcn/ui components (Button, Dialog, Separator) using the default style.

4. **File Structure**:
   ```
   components/
   ├── image-node/
   │   ├── ImageNode.tsx          # Main custom node component
   │   ├── ImageNodeToolbar.tsx   # Mini toolbar
   │   ├── FullScreenView.tsx     # Full-screen overlay with sidebar
   │   ├── types.ts               # TypeScript interfaces
   │   └── index.ts               # Module exports
   lib/
   └── image-utils.ts             # Image utility functions
   ```
