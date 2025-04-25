"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewCanvasPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save the canvas data to the database
    console.log("Creating new canvas");
  };

  return (
    <div className="mx-auto py-8">
      <div className="mb-6">
        <Button variant="link" asChild className="pl-0">
          <Link href="/">← Back to dashboard</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Canvas</h1>

        <form className="space-y-4" onSubmit={handleSave}>
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
              placeholder="Enter canvas title"
            />
          </div>

          <div className="pt-4">
            <Button type="submit">Create Canvas</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
