"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface NoteData {
  id: string;
  title: string;
  content: string;
  created: string;
}

export default function NoteEditor({ noteData }: { noteData: NoteData }) {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save the note data to the database
    console.log("Saving note");
  };

  return (
    <div className="bg-white">
      <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <input
            type="text"
            defaultValue={noteData.title}
            className="w-full text-3xl font-bold mb-2 py-2 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <p className="text-gray-500 mb-6">Created on {noteData.created}</p>
        </div>

        <div className="prose max-w-none">
          <textarea
            defaultValue={noteData.content}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="pt-4">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
