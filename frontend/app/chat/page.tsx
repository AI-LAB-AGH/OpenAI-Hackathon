"use client";
import Chat from "@/components/Chat";
import ChatSidebar from "@/components/ChatSidebar";
import { useState, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const [isSidebarShown, setIsSidebarShown] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (chatId) {
      setActiveChatId(Number(chatId));
    }
  }, [searchParams]);

  const showSidebar = () => {
    setIsSidebarShown(true);
  };

  const hideSidebar = () => {
    setIsSidebarShown(false);
  };

  const handleChatSelect = (chatId: number | null) => {
    setActiveChatId(chatId);
  };

  function handleCreateChat(newChatId: number) {
    setActiveChatId(newChatId);
  }

  return (
    <div className="flex h-[90vh] max-w-5xl mx-auto">
      <div className="flex">
        <div className="w-fit flex flex-col items-center pt-2">
          <button
            onClick={isSidebarShown ? hideSidebar : showSidebar}
            className="p-2 cursor-pointer text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <HiMenu size={24} />
          </button>
        </div>
        <div
          className={`transition-all duration-300 ${
            isSidebarShown
              ? "w-64 opacity-100 bg-white border-r border-neutral-200"
              : "w-0 opacity-0"
          }`}
        >
          {isSidebarShown && (
            <ChatSidebar
              isSidebarShown={isSidebarShown}
              onToggle={hideSidebar}
              activeChatId={activeChatId || undefined}
              onChatSelect={handleChatSelect}
            />
          )}
        </div>
      </div>
      <div className="flex-1">
        <Chat activeChatId={activeChatId} onCreateChat={handleCreateChat} />
      </div>
    </div>
  );
}
