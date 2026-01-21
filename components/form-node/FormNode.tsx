"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { NodeResizer, useInternalNode, type NodeProps } from "@xyflow/react";
import { User, Hash, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { useCanvasStore } from "@/lib/stores/canvas-store";
import type { FormNodeType, FormSubmission } from "./types";

type FormNodeComponentProps = NodeProps<FormNodeType>;

const BASE_WIDTH = 280;
const BASE_HEIGHT = 320;

function FormNodeComponent({ data, selected, id }: FormNodeComponentProps) {
  const updateNodeData = useCanvasStore((state) => state.updateNodeData);
  const internalNode = useInternalNode(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [date, setDate] = useState("");

  // Calculate scale based on node size
  const scale = useMemo(() => {
    const width = internalNode?.width ?? BASE_WIDTH;
    const height = internalNode?.height ?? BASE_HEIGHT;
    const scaleX = width / BASE_WIDTH;
    const scaleY = height / BASE_HEIGHT;
    return Math.min(scaleX, scaleY, 2); // Cap at 2x to prevent overly large elements
  }, [internalNode?.width, internalNode?.height]);

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
      }, 1500);
    },
    [data.submitted, id, isSubmitting, name, rollNumber, date, updateNodeData]
  );

  // Dynamic styles based on scale
  const styles = useMemo(
    () => ({
      padding: `${16 * scale}px`,
      gap: `${12 * scale}px`,
      titleSize: `${14 * scale}px`,
      labelSize: `${11 * scale}px`,
      inputSize: `${13 * scale}px`,
      inputPadding: `${8 * scale}px ${12 * scale}px`,
      inputHeight: `${36 * scale}px`,
      buttonHeight: `${40 * scale}px`,
      iconSize: Math.max(14, 16 * scale),
      borderRadius: `${8 * scale}px`,
      smallRadius: `${6 * scale}px`,
    }),
    [scale]
  );

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border-2 bg-linear-to-br from-background to-muted/30 shadow-lg transition-shadow hover:shadow-xl"
      style={{
        padding: styles.padding,
        borderRadius: styles.borderRadius,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={260}
        lineClassName="border-primary"
        handleClassName="h-3 w-3 rounded-sm border-2 border-primary bg-background"
      />

      {/* Header */}
      <div
        className="mb-2 flex items-center gap-2 border-b pb-2"
        style={{
          marginBottom: `${12 * scale}px`,
          paddingBottom: `${8 * scale}px`,
          gap: `${8 * scale}px`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg bg-primary/10"
          style={{
            width: `${28 * scale}px`,
            height: `${28 * scale}px`,
            borderRadius: styles.smallRadius,
          }}
        >
          <Hash
            style={{
              width: styles.iconSize,
              height: styles.iconSize,
            }}
            className="text-primary"
          />
        </div>
        <h3
          className="font-semibold text-foreground"
          style={{ fontSize: styles.titleSize }}
        >
          Registration Form
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1" style={{ gap: styles.gap }}>
        {isSubmitting ? (
          <div
            className="flex h-full flex-col items-center justify-center"
            style={{ gap: `${16 * scale}px` }}
          >
            <Loader2
              className="animate-spin text-primary"
              style={{
                width: `${32 * scale}px`,
                height: `${32 * scale}px`,
              }}
            />
            <p
              className="text-muted-foreground"
              style={{ fontSize: styles.inputSize }}
            >
              Submitting...
            </p>
            <div className="w-full space-y-2" style={{ gap: `${8 * scale}px` }}>
              <div
                className="animate-pulse rounded bg-muted"
                style={{
                  height: `${12 * scale}px`,
                  width: "75%",
                  borderRadius: styles.smallRadius,
                }}
              />
              <div
                className="animate-pulse rounded bg-muted"
                style={{
                  height: styles.inputHeight,
                  borderRadius: styles.smallRadius,
                }}
              />
              <div
                className="animate-pulse rounded bg-muted"
                style={{
                  height: `${12 * scale}px`,
                  width: "50%",
                  borderRadius: styles.smallRadius,
                }}
              />
            </div>
          </div>
        ) : submittedData ? (
          <div
            className="flex h-full flex-col"
            style={{ gap: `${12 * scale}px` }}
          >
            <div
              className="flex items-center justify-center rounded-lg bg-green-500/10 py-3"
              style={{
                padding: `${12 * scale}px`,
                borderRadius: styles.smallRadius,
                gap: `${8 * scale}px`,
              }}
            >
              <CheckCircle2
                className="text-green-600"
                style={{
                  width: `${20 * scale}px`,
                  height: `${20 * scale}px`,
                }}
              />
              <span
                className="font-medium text-green-600"
                style={{ fontSize: styles.inputSize }}
              >
                Submitted Successfully
              </span>
            </div>

            <div
              className="flex-1 space-y-3 rounded-lg bg-muted/50 p-3"
              style={{
                padding: `${12 * scale}px`,
                borderRadius: styles.smallRadius,
                gap: `${10 * scale}px`,
              }}
            >
              <DataRow
                icon={
                  <User
                    style={{
                      width: styles.iconSize - 2,
                      height: styles.iconSize - 2,
                    }}
                  />
                }
                label="Name"
                value={submittedData.name}
                scale={scale}
              />
              <DataRow
                icon={
                  <Hash
                    style={{
                      width: styles.iconSize - 2,
                      height: styles.iconSize - 2,
                    }}
                  />
                }
                label="Roll Number"
                value={String(submittedData.rollNumber)}
                scale={scale}
              />
              <DataRow
                icon={
                  <Calendar
                    style={{
                      width: styles.iconSize - 2,
                      height: styles.iconSize - 2,
                    }}
                  />
                }
                label="Date"
                value={submittedData.date}
                scale={scale}
              />
            </div>
          </div>
        ) : (
          <form
            className="flex h-full flex-col"
            onSubmit={handleSubmit}
            style={{ gap: `${10 * scale}px` }}
          >
            <FormField
              id={`name-${id}`}
              label="Full Name"
              icon={
                <User
                  style={{
                    width: styles.iconSize - 2,
                    height: styles.iconSize - 2,
                  }}
                />
              }
              type="text"
              value={name}
              onChange={setName}
              placeholder="Enter your name"
              scale={scale}
              styles={styles}
            />

            <FormField
              id={`roll-${id}`}
              label="Roll Number"
              icon={
                <Hash
                  style={{
                    width: styles.iconSize - 2,
                    height: styles.iconSize - 2,
                  }}
                />
              }
              type="number"
              value={rollNumber}
              onChange={setRollNumber}
              placeholder="Enter roll number"
              scale={scale}
              styles={styles}
            />

            <FormField
              id={`date-${id}`}
              label="Date"
              icon={
                <Calendar
                  style={{
                    width: styles.iconSize - 2,
                    height: styles.iconSize - 2,
                  }}
                />
              }
              type="date"
              value={date}
              onChange={setDate}
              scale={scale}
              styles={styles}
            />

            <button
              type="submit"
              className="mt-auto w-full rounded-lg bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
              style={{
                height: styles.buttonHeight,
                fontSize: styles.inputSize,
                borderRadius: styles.smallRadius,
                marginTop: `${8 * scale}px`,
              }}
            >
              Submit Form
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  scale: number;
  styles: {
    labelSize: string;
    inputSize: string;
    inputPadding: string;
    inputHeight: string;
    smallRadius: string;
    iconSize: number;
  };
}

function FormField({
  id,
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  scale,
  styles,
}: FormFieldProps) {
  return (
    <div style={{ gap: `${4 * scale}px` }} className="flex flex-col">
      <label
        className="flex items-center gap-1 font-medium text-muted-foreground"
        htmlFor={id}
        style={{
          fontSize: styles.labelSize,
          gap: `${4 * scale}px`,
        }}
      >
        {icon}
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-md border border-input bg-background transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        style={{
          fontSize: styles.inputSize,
          padding: styles.inputPadding,
          height: styles.inputHeight,
          borderRadius: styles.smallRadius,
        }}
      />
    </div>
  );
}

interface DataRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  scale: number;
}

function DataRow({ icon, label, value, scale }: DataRowProps) {
  return (
    <div className="flex items-center gap-2" style={{ gap: `${8 * scale}px` }}>
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <p
          className="text-muted-foreground"
          style={{ fontSize: `${10 * scale}px` }}
        >
          {label}
        </p>
        <p
          className="font-medium text-foreground"
          style={{ fontSize: `${13 * scale}px` }}
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

export const FormNode = memo(FormNodeComponent);
