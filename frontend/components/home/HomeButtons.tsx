"use client";
import { Button } from "@/components/ui/button";
import { HiOutlineMicrophone } from "react-icons/hi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Link from "next/link";
import { useAIAgentStore } from "@/store/aiAgentStore";

export default function HomeButtons() {
  const { setActive } = useAIAgentStore();

  return (
    <div className="flex gap-2">
      <Button
        className="bg-amber-400 cursor-pointer flex items-center gap-2"
        asChild
      >
        <Link href="/chat">
          <HiOutlineChatBubbleLeftRight size={20} />
          Open chat
        </Link>
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setActive(true)}
      >
        <HiOutlineMicrophone size={20} />
        Voice Assistant
      </Button>
    </div>
  );
}
