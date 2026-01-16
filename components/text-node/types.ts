export type TextAlignment = "left" | "center" | "right";

export interface TextFormatting {
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
  alignment: TextAlignment;
}

export interface TextNodeData {
  text: string;
  formatting: TextFormatting;
  [key: string]: unknown;
}

export const defaultFormatting: TextFormatting = {
  fontSize: 16,
  bold: false,
  italic: false,
  color: "#000000",
  alignment: "left",
};
