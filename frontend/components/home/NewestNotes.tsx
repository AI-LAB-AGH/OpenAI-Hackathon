"use client";
import React, { useEffect, useState } from "react";
import NoteCard from "../NoteCard";
import { noteApi } from "@/lib/api";
import { Note } from "@/lib/types";

function NewestNotes() {
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

        const sortedNotes = result.notes.slice(0, 6);
        // TODO: add date sorting

        setNotes(sortedNotes);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-md bg-gray-100 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading notes: {error}</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="text-gray-500">
        No notes found. Create your first note!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes
        .filter((note) => note.id !== undefined)
        .map((note) => (
          <NoteCard
            key={note.id}
            id={note.id as string}
            title={note.title}
            description={
              note.content.substring(0, 100) +
              (note.content.length > 100 ? "..." : "")
            }
          />
        ))}
    </div>
  );
}

export default NewestNotes;
