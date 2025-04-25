"use client";
import Chat from "@/components/Chat";
import ChatSidebar from "@/components/ChatSidebar";
import { useState } from "react";

export default function ChatPage() {
  const [isSidebarShown, setIsSidebarShown] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

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
    <div className="flex gap-6 h-[90vh] p-4">
      {isSidebarShown && (
        <div className="w-1/5">
          <ChatSidebar
            isSidebarShown={isSidebarShown}
            onToggle={hideSidebar}
            activeChatId={activeChatId || undefined}
            onChatSelect={handleChatSelect}
          />
        </div>
      )}
      <div className="flex-1 bg-white rounded-md">
        <Chat
          activeChatId={activeChatId}
          onCreateChat={handleCreateChat}
          onShowSidebar={!isSidebarShown ? showSidebar : undefined}
        />
      </div>
    </div>
  );
}
