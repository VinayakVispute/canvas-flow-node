"use client";

import { memo, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useReactFlow } from "@xyflow/react";
import { TextFormatToolbar } from "./TextFormatToolbar";
import type { TextNodeData, TextFormatting } from "./types";
import { defaultFormatting } from "./types";

interface TextNodeComponentProps {
  id: string;
  data: TextNodeData;
  selected?: boolean;
}

function TextNodeComponent({ id, data, selected }: TextNodeComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();

  const formatting = useMemo(
    () => data.formatting || defaultFormatting,
    [data.formatting]
  );

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text, isEditing]);

  // Sync text state with data when not editing
  useEffect(() => {
    if (!isEditing) {
      setText(data.text);
    }
  }, [data.text, isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const updateNodeData = useCallback(
    (updates: Partial<TextNodeData>) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    updateNodeData({ text: text || "Double-click to edit" });
  }, [text, updateNodeData]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        setText(data.text);
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
      }
    },
    [data.text, handleBlur]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    []
  );

  const handleFormattingChange = useCallback(
    (newFormatting: Partial<TextFormatting>) => {
      updateNodeData({
        formatting: { ...formatting, ...newFormatting },
      });
    },
    [formatting, updateNodeData]
  );

  const textStyle: React.CSSProperties = {
    fontSize: `${formatting.fontSize}px`,
    fontWeight: formatting.bold ? "bold" : "normal",
    fontStyle: formatting.italic ? "italic" : "normal",
    color: formatting.color,
    textAlign: formatting.alignment,
  };

  return (
    <>
      {selected && (
        <TextFormatToolbar
          formatting={formatting}
          onFormattingChange={handleFormattingChange}
        />
      )}

      <div
        className="min-w-[50px] cursor-text"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full min-w-[150px] resize-none bg-transparent outline-none"
            style={textStyle}
            placeholder="Enter text..."
            rows={1}
          />
        ) : (
          <p className="whitespace-pre-wrap" style={textStyle}>
            {data.text || "Double-click to edit"}
          </p>
        )}
      </div>
    </>
  );
}

export const TextNode = memo(TextNodeComponent);
