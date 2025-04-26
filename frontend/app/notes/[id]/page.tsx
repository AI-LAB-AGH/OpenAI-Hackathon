"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NoteEditor from "@/components/notes/NoteEditor";
import { noteApi } from "@/lib/api";
import { Note } from "@/lib/types";

type PageParams = { params: Promise<{ id: string }> };

export default function NotePage({ params }: PageParams) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const result = await noteApi.getNote(id);

        if (!result.success || !result.note) {
          throw new Error("Failed to load note");
        }

        setNote(result.note);
      } catch (err) {
        console.error("Failed to fetch note:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-6">
          <Button variant="link" asChild className="px-0">
            <Link href="/">← Back to notes</Link>
          </Button>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-6">
          <Button variant="link" asChild className="px-0">
            <Link href="/">← Back to notes</Link>
          </Button>
        </div>
        <div className="text-red-500">{error || "Note not found"}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-6">
        <Button variant="link" asChild className="px-0">
          <Link href="/">← Back to notes</Link>
        </Button>
      </div>

      <NoteEditor
        noteData={note}
        onSave={async (updatedNote) => {
          // This will be implemented in the NoteEditor component
        }}
      />
    </div>
  );
}
