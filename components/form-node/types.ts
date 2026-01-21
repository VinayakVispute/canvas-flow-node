import type { Node } from "@xyflow/react";

export interface FormSubmission {
  name: string;
  rollNumber: number;
  date: string;
}

export interface FormNodeData {
  submitted: boolean;
  submission: FormSubmission | null;
  [key: string]: unknown;
}

export type FormNodeType = Node<FormNodeData, "form">;
