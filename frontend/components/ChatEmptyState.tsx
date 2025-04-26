"use client";

import {
  HiOutlineLightBulb,
  HiOutlineSparkles,
  HiOutlineBookOpen,
} from "react-icons/hi";

export default function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="max-w-2xl space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          How can I help you today?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 hover:border-amber-400 transition-colors">
            <HiOutlineLightBulb className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <h3 className="font-medium mb-1">Brainstorm Ideas</h3>
            <p className="text-sm text-gray-600">
              Get creative suggestions and explore new concepts
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 hover:border-amber-400 transition-colors">
            <HiOutlineSparkles className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <h3 className="font-medium mb-1">Generate Content</h3>
            <p className="text-sm text-gray-600">
              Create engaging content for your notes and projects
            </p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 hover:border-amber-400 transition-colors">
            <HiOutlineBookOpen className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <h3 className="font-medium mb-1">Learn & Research</h3>
            <p className="text-sm text-gray-600">
              Get detailed explanations and research assistance
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Start a conversation by typing your message below
        </p>
      </div>
    </div>
  );
}
