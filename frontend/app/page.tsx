import NoteCard from "@/components/NoteCard";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Mock data for notes - in a real app, this would come from an API or database
  const notes = [
    {
      id: "note-1",
      title: "Biology Notes",
      description: "Cell structure and function",
    },
    {
      id: "note-2",
      title: "Physics Formulas",
      description: "Key equations for mechanics",
    },
    {
      id: "note-3",
      title: "History Timeline",
      description: "Important historical events",
    },
    {
      id: "note-4",
      title: "Math Reference",
      description: "Calculus theorems and proofs",
    },
    {
      id: "note-5",
      title: "Programming Concepts",
      description: "Data structures and algorithms overview",
    },
  ];

  return (
    <div className="bg-white gap-16 flex flex-col min-h-screen py-8">
      <section id="chat">
        <h1 className="text-2xl mb-6 font-bold">AI Assistant</h1>
        <Button asChild>
          <Link href="/chat">Open chat</Link>
        </Button>
      </section>

      <section id="notes" className="container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Notes</h1>
          <Button variant={"link"} asChild>
            <Link href="/notes/new">Create New Note</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              description={note.description}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
