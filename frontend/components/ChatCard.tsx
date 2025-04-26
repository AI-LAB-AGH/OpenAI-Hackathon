import { HiOutlineChat } from "react-icons/hi";

interface ChatCardProps {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export default function ChatCard({
  id,
  title,
  isActive,
  onSelect,
}: ChatCardProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`w-full p-3 text-left rounded-md transition-colors ${
        isActive
          ? "bg-neutral-100 text-neutral-900"
          : "text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <HiOutlineChat size={20} className="flex-shrink-0" />
        <span className="truncate">{title}</span>
      </div>
    </button>
  );
}
