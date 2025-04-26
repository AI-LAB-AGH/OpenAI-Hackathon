"use client";
import { HiMicrophone, HiPhone } from "react-icons/hi";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AIAgentCall() {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleClick = () => {
    setIsActive(true);
  };

  const handleEndCall = () => {
    setIsActive(false);
    setIsMuted(false);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "bg-background border shadow-sm transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden",
          isActive
            ? "w-64 h-fit rounded-3xl"
            : "w-10 h-10 rounded-full cursor-pointer"
        )}
        onClick={!isActive ? handleClick : undefined}
      >
        {!isActive ? (
          <div className="w-6 h-6 rounded-full bg-zinc-600 animate-pulse" />
        ) : (
          <div className="flex items-center justify-between w-full px-4 py-3">
            {/* Voice Waveform */}
            <div className="flex items-center gap-1">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-4 bg-primary/20 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  isMuted ? "bg-white" : "bg-muted"
                )}
              >
                <HiMicrophone
                  className={cn(
                    "w-4 h-4",
                    isMuted ? "text-destructive" : "text-muted-foreground"
                  )}
                />
              </button>
              <button
                onClick={handleEndCall}
                className="p-1.5 rounded-full bg-destructive text-destructive-foreground transition-colors"
              >
                <HiPhone fill="white" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
