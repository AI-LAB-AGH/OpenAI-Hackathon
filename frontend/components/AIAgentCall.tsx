"use client";
import { cn } from "@/lib/utils";
import VoiceRecorder from "./VoiceRecorder";
import { useAIAgentStore } from "@/store/aiAgentStore";

export default function AIAgentCall() {
  const { isActive, setActive } = useAIAgentStore();

  const handleEndCall = () => {
    setActive(false);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "bg-background border shadow-sm flex items-center justify-center overflow-hidden",
          "transition-[width,height,border-radius] duration-300 ease-out",
          isActive
            ? "w-[250px] h-[60px] rounded-3xl"
            : "w-10 h-10 rounded-full cursor-pointer"
        )}
        onClick={!isActive ? () => setActive(true) : undefined}
      >
        {!isActive ? (
          <div className="w-6 h-6 rounded-full bg-amber-500 animate-[pulse_2s_ease-in-out_infinite]" />
        ) : (
          <div className="flex items-center justify-between w-full px-4">
            <VoiceRecorder onEndCall={handleEndCall} />
          </div>
        )}
      </div>
    </div>
  );
}
