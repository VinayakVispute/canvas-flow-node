import type { Point } from "./types";

/**
 * Convert an array of points to a smooth SVG path using quadratic bezier curves.
 * This creates natural-looking, rounded lines instead of jagged straight segments.
 */
export function pointsToSmoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    // Single point - draw a tiny circle/dot
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${
      points[0].y + 0.1
    }`;
  }
  if (points.length === 2) {
    // Two points - draw a straight line
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  // Start the path at the first point
  let path = `M ${points[0].x} ${points[0].y}`;

  // Use quadratic bezier curves for smooth connections
  // For each point (except first and last), use it as a control point
  // and the midpoint between it and the next point as the end point
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    // Calculate midpoint between current and next point
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    // Quadratic bezier: Q controlX controlY endX endY
    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
  }

  // Connect to the last point with a final line or curve
  const lastPoint = points[points.length - 1];
  const secondLastPoint = points[points.length - 2];

  // Final quadratic curve to the last point
  path += ` Q ${secondLastPoint.x} ${secondLastPoint.y} ${lastPoint.x} ${lastPoint.y}`;

  return path;
}

/**
 * Creates a throttled version of a function that uses requestAnimationFrame.
 * This ensures the function runs at most once per animation frame (~60fps).
 */
export function rafThrottle<T extends (...args: any[]) => void>(
  fn: T
): T & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          fn(...lastArgs);
        }
        rafId = null;
      });
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return throttled;
}

/**
 * Calculate the distance between two points.
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Simplify a path by removing points that are too close together.
 * This reduces the number of points while maintaining the path's shape.
 * @param points - Array of points to simplify
 * @param minDistance - Minimum distance between consecutive points
 */
export function simplifyPath(
  points: Point[],
  minDistance: number = 2
): Point[] {
  if (points.length <= 2) return points;

  const simplified: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const lastKept = simplified[simplified.length - 1];
    if (distance(lastKept, points[i]) >= minDistance) {
      simplified.push(points[i]);
    }
  }

  // Always keep the last point
  simplified.push(points[points.length - 1]);

  return simplified;
}
