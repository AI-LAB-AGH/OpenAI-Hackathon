import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NoteEditor from "@/components/notes/NoteEditor";

// This is a dynamic route that will match any note ID in the URL
export default function NotePage({ params }: { params: { id: string } }) {
  // Server component can directly access params without React.use()
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

      {/* Client component for interactive parts */}
      <NoteEditor noteData={mockNoteData} />
    </div>
  );
}
