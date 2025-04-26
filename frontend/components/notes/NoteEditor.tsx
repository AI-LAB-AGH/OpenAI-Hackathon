"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Note } from "@/lib/types";
import { noteApi } from "@/lib/api";
import { HiDotsVertical, HiTrash } from "react-icons/hi";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteEditorProps {
  noteData: Note;
  onSave?: (updatedNote: Note) => Promise<void>;
}

export default function NoteEditor({ noteData }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(noteData.title);
  const [content, setContent] = useState(noteData.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formattedDate = noteData.created_at
    ? new Date(noteData.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updatedNote: Note = {
        ...noteData,
        title,
        content,
      };

      // If the note has an ID, we're updating an existing note
      if (noteData.id) {
        const result = await noteApi.updateNote(noteData.id, updatedNote);
        if (!result.success) {
          throw new Error(result.error || "Failed to save note");
        }
        setSaveSuccess(true);
      } else {
        // This is a new note
        const result = await noteApi.createNote(updatedNote);
        if (!result.success) {
          throw new Error(result.error || "Failed to create note");
        }
        setSaveSuccess(true);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setSaveError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteData.id) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await noteApi.deleteNote(noteData.id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete note");
      }

      router.push("/");
    } catch (error) {
      console.error("Error deleting note:", error);
      setDeleteError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white">
      <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold mb-2 py-2 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Note Title"
              required
            />

            {noteData.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    disabled={isDeleting}
                  >
                    <HiDotsVertical size={24} className="text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    variant="destructive"
                    disabled={isDeleting}
                    className="cursor-pointer"
                  >
                    <HiTrash className="mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Note"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="text-gray-500 mb-6">Created on {formattedDate}</p>
        </div>

        <div className="prose max-w-none">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your note content here..."
          ></textarea>
        </div>

        {saveError && <div className="text-red-500 mt-2">{saveError}</div>}
        {saveSuccess && (
          <div className="text-green-500 mt-2">Note saved successfully!</div>
        )}
        {deleteError && <div className="text-red-500 mt-2">{deleteError}</div>}

        <div className="pt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
