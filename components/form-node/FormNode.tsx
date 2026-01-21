"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { FormNodeType, FormSubmission } from "./types";

type FormNodeComponentProps = NodeProps<FormNodeType>;

function FormNodeComponent({ data, selected, id }: FormNodeComponentProps) {
  const updateNodeData = useCanvasStore((state) => state.updateNodeData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [date, setDate] = useState("");

  const submittedData = useMemo(
    () => (data.submitted ? data.submission : null),
    [data.submitted, data.submission]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (isSubmitting || data.submitted) return;

      setIsSubmitting(true);
      const submission: FormSubmission = {
        name,
        rollNumber: Number.parseInt(rollNumber || "0", 10),
        date,
      };

      setTimeout(() => {
        updateNodeData(id, { submitted: true, submission });
        setIsSubmitting(false);
      }, 1200);
    },
    [data.submitted, id, isSubmitting, name, rollNumber, date, updateNodeData]
  );

  return (
    <div className="h-full w-full rounded-lg border bg-background p-3 shadow-sm">
      <NodeResizer
        isVisible={selected}
        minWidth={240}
        minHeight={200}
        lineClassName="border-primary"
        handleClassName="h-3 w-3 rounded-sm border-2 border-primary bg-background"
      />

      <h3 className="mb-3 text-sm font-semibold">Form</h3>

      {isSubmitting ? (
        <div className="space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
        </div>
      ) : submittedData ? (
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span> {submittedData.name}
          </div>
          <div>
            <span className="text-muted-foreground">Roll Number:</span> {submittedData.rollNumber}
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span> {submittedData.date}
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            Submitted
          </div>
        </div>
      ) : (
        <form className="space-y-2" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor={`name-${id}`}>
              Name
            </label>
            <input
              id={`name-${id}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border bg-background px-2 py-1 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor={`roll-${id}`}>
              Roll Number
            </label>
            <input
              id={`roll-${id}`}
              type="number"
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
              className="w-full rounded border bg-background px-2 py-1 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor={`date-${id}`}>
              Date
            </label>
            <input
              id={`date-${id}`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded border bg-background px-2 py-1 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

export const FormNode = memo(FormNodeComponent);
