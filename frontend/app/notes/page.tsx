"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { noteApi } from "@/lib/api";
import { Note } from "@/lib/types";
import NoteCard from "@/components/NoteCard";
import Link from "next/link";
import { HiOutlinePlusCircle } from "react-icons/hi";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const result = await noteApi.getNotes();

        if (!result.success) {
          throw new Error("Failed to load notes");
        }

        setNotes(result.notes);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Notes</h1>
        <div className="flex items-center">
          <Button variant="ghost" asChild>
            <Link href="/notes/new" className="flex items-center gap-2">
              <HiOutlinePlusCircle size={32} />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            id={note.id}
            title={note.title}
            description={note.content}
          />
        ))}
      </div>
    </div>
  );
}
