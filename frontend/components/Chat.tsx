"use client";
import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import Message from "./Message";
import LoadingDot from "./LoadingDot";
import { HiMenu } from "react-icons/hi";
import { useChat } from "@/hooks/useChat";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";

interface ChatProps {
  activeChatId: number | null;
  onShowSidebar?: () => void;
  onCreateChat: (newChatId: number) => void;
}

export default function Chat({
  onShowSidebar,
  activeChatId,
  onCreateChat,
}: ChatProps) {
  const { isLoading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages from database
  const dbMessages =
    useLiveQuery(async () => {
      if (!activeChatId) {
        return [];
      }
      return await db.messages
        .where("chatId")
        .equals(activeChatId)
        .sortBy("createdAt");
    }, [activeChatId]) || [];

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [dbMessages, isLoading]);

  const handleSendMessage = async (message: string) => {
    // If no active chat, create a new one
    if (!activeChatId) {
      const newChatId = await db.chats.add({
        title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
        createdAt: new Date(),
      });

      onCreateChat(newChatId);

      // Using the newly created chat
      sendMessage(message, newChatId, null);
    } else {
      // Using existing chat
      sendMessage(message, activeChatId, null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        {onShowSidebar && (
          <button onClick={onShowSidebar} className="p-2 cursor-pointer">
            <HiMenu size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {dbMessages.map((msg, index) => (
          <Message key={index} content={msg.content} role={msg.role} />
        ))}
        {isLoading && <LoadingDot />}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-2">
        <ChatInput isLoading={isLoading} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
