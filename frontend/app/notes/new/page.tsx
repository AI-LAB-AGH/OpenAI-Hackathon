import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewNotePage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6">
        <Button variant="link" asChild className="pl-0">
          <Link href="/">← Back to notes</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Note</h1>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter note title"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your note content here..."
            ></textarea>
          </div>

          <div className="pt-4">
            <Button type="submit">Save Note</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
