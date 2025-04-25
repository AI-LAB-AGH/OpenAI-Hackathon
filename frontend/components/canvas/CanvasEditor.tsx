"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import SignatureCanvas from "react-signature-canvas";

interface CanvasData {
  id: string;
  title: string;
  created: string;
}

export default function CanvasEditor({
  canvasData,
}: {
  canvasData: CanvasData;
}) {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save the canvas data to the database
    console.log("Saving canvas");
  };

  return (
    <div className="bg-white ">
      <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <input
            type="text"
            defaultValue={canvasData.title}
            className="w-full text-3xl font-bold mb-2 py-2 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="border relative h-[70vh] w-full">
          <SignatureCanvas
            penColor="green"
            canvasProps={{ className: "w-full h-full" }}
          />

          {/* AI Agent Circle - Pure CSS version */}
          <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center cursor-pointer font-bold text-xs">
            AI
          </div>
        </div>
      </form>
    </div>
  );
}
