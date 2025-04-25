"use client";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { HiMenu, HiOutlineChat, HiTrash } from "react-icons/hi";

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
  if (!isSidebarShown) {
    return null;
  }

  const chats = useLiveQuery(() => db.chats.toArray()) || [];

  return (
    <div className="h-full  p-4 rounded-md">
      <div className="mb-4 flex justify-between text-neutral-600 items-center">
        <button onClick={onToggle} className="p-2 cursor-pointer">
          <HiMenu size={24} />
        </button>
        <button>
          <HiOutlineChat
            className="cursor-pointer"
            size={24}
            onClick={() => onChatSelect(null)}
          />
        </button>
      </div>

      <ol className="flex flex-col-reverse flex-dire gap-2">
        {chats.map((chat) => (
          <li key={chat.id}>
            <ChatCard
              id={chat.id}
              title={chat.title}
              isActive={activeChatId === chat.id}
              onSelect={onChatSelect}
            />
          </li>
        ))}

        {chats.length === 0 && <p className="text-gray-400 px-3">No chats</p>}
      </ol>
    </div>
  );
}

export default ChatSidebar;
