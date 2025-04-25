"use client";
import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="flex rounded-lg gap-2">
      <textarea
        autoFocus
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2 rounded-lg  bg-neutral-200 resize-none min-h-[32px]  max-h-[160px]"
        placeholder="Type a message..."
        rows={1}
      />
      {/* <Textarea
        autoFocus
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
      /> */}

      {/* <Button type="submit" disabled={!message.trim() || isLoading}>
        Send
      </Button> */}
      <button
        type="submit"
        className="bg-white px-4 py-2 rounded-lg self-end cursor-pointer"
      >
        Send
      </button>
    </form>
  );
}
