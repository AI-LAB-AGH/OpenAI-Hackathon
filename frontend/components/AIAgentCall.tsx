"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import VoiceRecorder from "./VoiceRecorder";

export default function AIAgentCall() {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(true);
  };

  const handleEndCall = () => {
    setIsActive(false);
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
        onClick={!isActive ? handleClick : undefined}
      >
        {!isActive ? (
          <div className="w-6 h-6 rounded-full bg-amber-500 animate-pulse" />
        ) : (
          <div className="flex items-center justify-between w-full px-4">
            <VoiceRecorder onEndCall={handleEndCall} />
          </div>
        )}
      </div>
    </div>
  );
}
