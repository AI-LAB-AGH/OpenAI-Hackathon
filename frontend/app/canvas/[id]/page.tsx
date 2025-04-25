import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CanvasEditor from "@/components/canvas/CanvasEditor";

// This is a dynamic route that will match any canvas ID in the URL
export default function CanvasPage({ params }: { params: { id: string } }) {
  // Server component can directly access params without React.use()
  const id = params.id;

  // Mock canvas data - in a real app, this would be fetched from an API or database
  const mockCanvasData = {
    id: id,
    title: `Canvas ${id}`,
    created: "April 25, 2025",
  };

  return (
    <div className="mx-auto">
      <div className="mb-4"></div>

      {/* Client component for interactive parts */}
      <CanvasEditor canvasData={mockCanvasData} />
    </div>
  );
}
