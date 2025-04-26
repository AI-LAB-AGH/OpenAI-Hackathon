import NoteCard from "@/components/NoteCard";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiOutlineDocumentText, HiOutlinePencilAlt } from "react-icons/hi";

export default function Home() {
  // Mock data for notes - in a real app, this would come from an API or database
  const notes = [
    {
      id: "note-1",
      title: "Biology Notes",
      description: "Cell structure and function",
      type: "text",
    },
    {
      id: "note-2",
      title: "Physics Formulas",
      description: "Key equations for mechanics",
      type: "text",
    },
    {
      id: "note-4",
      title: "Math Reference",
      description: "Calculus theorems and proofs",
      type: "text",
    },
  ];

  // Mock data for canvases
  const canvases = [
    {
      id: "canvas-1",
      title: "History Timeline",
      description: "Important historical events",
      type: "canvas",
    },
    {
      id: "canvas-2",
      title: "Programming Concepts",
      description: "Data structures and algorithms overview",
      type: "canvas",
    },
  ];

  return (
    <div className="gap-16 flex max-w-5xl mx-auto flex-col min-h-screen py-8 w-full">
      <section id="chat">
        <h1 className="text-2xl mb-6 font-bold">AI Assistant</h1>
        <Button asChild>
          <Link href="/chat">Open chat</Link>
        </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              description={note.description}
              type="text"
            />
          ))}
        </div>
      </section>

      {/* Canvases Section */}
      <section id="canvases" className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">My Canvases</h1>
          </div>
          <Button variant="link" asChild>
            <Link href="/canvas/new">Create New Canvas</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canvases.map((canvas) => (
            <NoteCard
              key={canvas.id}
              id={canvas.id}
              title={canvas.title}
              description={canvas.description}
              type="canvas"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
