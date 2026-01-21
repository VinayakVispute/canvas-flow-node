export interface TextFormatting {
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;
}

export interface TextNodeData {
  text: string;
  formatting: TextFormatting;
  [key: string]: unknown;
}

export const defaultFormatting: TextFormatting = {
  fontSize: 16,
  fontFamily: "Inter, sans-serif",
  bold: false,
  italic: false,
  color: "#000000",
};

export const FONT_FAMILIES = [
  { name: "Inter", value: "Inter, sans-serif", category: "sans" },
  { name: "Roboto", value: "Roboto, sans-serif", category: "sans" },
  { name: "Open Sans", value: "Open Sans, sans-serif", category: "sans" },
  { name: "Playfair", value: "Playfair Display, serif", category: "serif" },
  { name: "Merriweather", value: "Merriweather, serif", category: "serif" },
  { name: "Pacifico", value: "Pacifico, cursive", category: "decorative" },
  { name: "Dancing Script", value: "Dancing Script, cursive", category: "decorative" },
  { name: "Lobster", value: "Lobster, cursive", category: "decorative" },
  { name: "Fira Code", value: "Fira Code, monospace", category: "mono" },
  { name: "JetBrains Mono", value: "JetBrains Mono, monospace", category: "mono" },
] as const;
