import NoteCard from "@/components/NoteCard";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  HiOutlineDocumentText,
  HiOutlineMicrophone,
  HiOutlinePlusCircle,
} from "react-icons/hi";
import NewestNotes from "@/components/home/NewestNotes";
import HomeButtons from "@/components/home/HomeButtons";

export default function Home() {
  return (
    <div className="gap-24 flex max-w-5xl mx-auto flex-col min-h-screen pt-16 w-full">
      <section id="chat">
        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40">
            <div
              className="absolute inset-0 bg-amber-400/20 rounded-full opacity-40 animate-ping"
              style={{ animationDuration: "3s" }}
            ></div>
            <div
              className="absolute inset-0 bg-yellow-300/50 rounded-full opacity-50 animate-pulse"
              style={{ animationDuration: "2s" }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/app-illustration.png"
                alt="App illustration"
                width={128}
                height={128}
                className="rounded-full"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl mb-2 font-semibold">
              Your Notes, Smarter Than Ever
            </h1>
            <p className="mb-4">
              Transform scattered thoughts into smart insights with AI
              assistance
            </p>
            <HomeButtons />
          </div>
        </div>
      </section>

      {/* Notes Section */}
      <section id="notes">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Recent notes</h1>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" asChild>
              <Link href="/notes">View All Notes</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/notes/new" className="flex items-center gap-2">
                <HiOutlinePlusCircle size={32} />
              </Link>
            </Button>
          </div>
        </div>

        <NewestNotes />
      </section>
    </div>
  );
}
