"use client";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { HiMenu, HiOutlineChat, HiTrash, HiX } from "react-icons/hi";

interface ChatCardProps {
  id: number;
  title: string;
  isActive?: boolean;
  onSelect: (id: number) => void;
}

function ChatCard({ id, title, isActive = false, onSelect }: ChatCardProps) {
  async function handleDeleteChat(chatId: number) {
    await db.messages.where("chatId").equals(chatId).delete();
    await db.chats.delete(chatId);
  }

  return (
    <div
      className={`w-full flex justify-between items-center p-2 rounded-md ${
        isActive ? "bg-neutral-200" : "hover:bg-neutral-100"
      }`}
    >
      <div
        className="flex-1 cursor-pointer truncate"
        onClick={() => onSelect(id)}
      >
        {title}
      </div>
      <button
        onClick={() => handleDeleteChat(id)}
        className="p-1 ml-2 cursor-pointer text-neutral-600 hover:text-red-500 hover:bg-gray-100 rounded-full"
        aria-label="Delete chat"
      >
        <HiTrash size={16} />
      </button>
    </div>
  );
}

interface ChatSidebarProps {
  isSidebarShown: boolean;
  onToggle: () => void;
  activeChatId?: number | null;
  onChatSelect: (chatId: number | null) => void;
}

function ChatSidebar({
  isSidebarShown,
  onToggle,
  activeChatId,
  onChatSelect,
}: ChatSidebarProps) {
  const chats = useLiveQuery(() => db.chats.toArray()) || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-800">Chats</h2>
        <button
          onClick={onToggle}
          className="p-2 cursor-pointer text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
        >
          <HiX size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {chats.map((chat) => (
          <ChatCard
            key={chat.id}
            id={chat.id}
            title={chat.title}
            isActive={chat.id === activeChatId}
            onSelect={onChatSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default ChatSidebar;
