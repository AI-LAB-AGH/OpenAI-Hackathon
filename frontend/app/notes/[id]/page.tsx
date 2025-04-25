import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// This is a dynamic route that will match any note ID in the URL
export default function NotePage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the note data based on the ID
  // For now, let's create mock data based on the ID
  const id = params.id;

  // Mock note data - in a real app, this would be fetched from an API
  const mockNoteData = {
    id: id,
    title: `Note ${id}`,
    content:
      "This is the detailed content of the note. In a real application, this would be fetched from a database or API based on the note ID.",
    created: "April 25, 2025",
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6">
        <Button variant="link" asChild className="px-0">
          <Link href="/">← Back to notes</Link>
        </Button>
      </div>

      <div className="bg-white ">
        <form className="space-y-4">
          <div>
            <input
              type="text"
              defaultValue={mockNoteData.title}
              className="w-full text-3xl font-bold mb-2 py-2 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <p className="text-gray-500 mb-6">
              Created on {mockNoteData.created}
            </p>
          </div>

          <div className="prose max-w-none">
            <textarea
              defaultValue={mockNoteData.content}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="pt-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
