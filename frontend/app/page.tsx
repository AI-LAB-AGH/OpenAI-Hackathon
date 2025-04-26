import NoteCard from "@/components/NoteCard";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiOutlineDocumentText } from "react-icons/hi";
import NewestNotes from "@/components/home/NewestNotes";

export default function Home() {
  return (
    <div className="gap-16 flex max-w-5xl mx-auto flex-col min-h-screen py-8 w-full">
      <section id="chat">
        <div className="flex items-center gap-6">
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 bg-slate-300 rounded-full opacity-40 animate-ping"
              style={{ animationDuration: "3s" }}
            ></div>
            <div
              className="absolute inset-0 bg-slate-400 rounded-full opacity-50 animate-pulse"
              style={{ animationDuration: "2s" }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-slate-700 rounded-full shadow-lg"></div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl mb-4 font-bold">AI Assistant</h1>
            <Button asChild>
              <Link href="/chat">Open chat</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Notes Section */}
      <section id="notes">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">My Notes</h1>
          </div>
          <Button variant="link" asChild>
            <Link href="/notes/new">Create New Note</Link>
          </Button>
        </div>

        <NewestNotes />
      </section>
    </div>
  );
}
