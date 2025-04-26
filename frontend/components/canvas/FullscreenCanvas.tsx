"use client";

import React, { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { canvasStorage } from "@/lib/canvasStorage";
import Link from "next/link";

interface FullscreenCanvasProps {
  noteId: string;
  onClose: () => void;
}

export default function FullscreenCanvas({
  noteId,
  onClose,
}: FullscreenCanvasProps) {
  const canvasRef = useRef<SignatureCanvas>(null);

  // Load saved canvas data on mount
  useEffect(() => {
    const savedCanvas = canvasStorage.getCanvas(noteId);
    if (savedCanvas && canvasRef.current) {
      canvasRef.current.fromDataURL(savedCanvas.data);
    }
  }, [noteId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (canvasRef.current) {
      const data = canvasRef.current.toDataURL();
      canvasStorage.saveCanvas(noteId, data);
      onClose();
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose} asChild>
              <Link href={`/notes/${noteId}`}>← Back to note</Link>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
            <Button onClick={handleSave}>Save & Close</Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 w-full">
          <SignatureCanvas
            ref={canvasRef}
            penColor="black"
            canvasProps={{
              className: "w-full h-full",
            }}
          />
        </div>
      </div>
    </div>
  );
}
