"use client";

import React from "react";
import FullscreenCanvas from "@/components/canvas/FullscreenCanvas";

export default function CanvasPage({ params }: { params: { id: string } }) {
  const handleSave = (data: string) => {
    // In a real app, you would save the canvas data to the database
    console.log("Saving canvas data:", data.substring(0, 100) + "...");
  };

  return <FullscreenCanvas title={`Canvas ${params.id}`} onSave={handleSave} />;
}
