"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TextEditorProps {
  defaultValue?: string;
  onChange?: (text: string) => void;
}

export default function TextEditor({
  defaultValue = "",
  onChange,
}: TextEditorProps) {
  const [rawText, setRawText] = useState(defaultValue);
  const [formattedText, setFormattedText] = useState("");
  const [isEditMode, setIsEditMode] = useState(true);

  // Format text when rawText changes
  useEffect(() => {
    // Simple formatter that converts "# text" to heading
    const formatted = formatText(rawText);
    setFormattedText(formatted);

    // Call onChange if provided
    if (onChange) {
      onChange(rawText);
    }
  }, [rawText, onChange]);

  // Simple formatter that handles headings
  const formatText = (text: string): string => {
    // Split the text into lines
    const lines = text.split("\n");

    // Process each line
    const formattedLines = lines.map((line) => {
      // Check if the line starts with # (heading)
      if (line.startsWith("# ")) {
        return `<h1 class="text-2xl font-bold my-3">${line.substring(2)}</h1>`;
      } else if (line.startsWith("## ")) {
        return `<h2 class="text-xl font-bold my-2">${line.substring(3)}</h2>`;
      } else if (line.startsWith("### ")) {
        return `<h3 class="text-lg font-bold my-2">${line.substring(4)}</h3>`;
      }

      // Regular paragraph
      return `<p class="my-1">${line}</p>`;
    });

    return formattedLines.join("");
  };

  // Toggle between edit and display modes
  const toggleMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="text-editor-container">
      {/* Mode toggle button */}
      <div className="mode-toggle mb-2 flex justify-end">
        <Button onClick={toggleMode} variant="outline" type="button" size="sm">
          {isEditMode ? "Switch to Display" : "Switch to Edit"}
        </Button>
      </div>

      {/* Conditional rendering based on mode */}
      {isEditMode ? (
        /* Edit Mode: Show textarea and preview */
        <>
          <div className="editor-input">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={8}
              placeholder="Type your note content here... Use # for headings"
            />
          </div>

          <div className="preview-container mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Preview:</h3>
            <div
              className="preview-contentborder border-gray-200 rounded-md bg-gray-50"
              dangerouslySetInnerHTML={{ __html: formattedText }}
            />
          </div>
        </>
      ) : (
        /* Display Mode: Show only formatted content in a clean view */
        <div
          className="display-content p-4 border border-gray-200 rounded-md bg-white prose max-w-none"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      )}
    </div>
  );
}
