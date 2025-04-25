import Dexie, { type EntityTable } from "dexie";

interface Chat {
  id: number;
  title: string;
  createdAt: Date;
}

interface Message {
  id?: number;
  chatId: number;
  role: "user" | "assistant";
  content: string;
  responseId?: string;
  createdAt: Date;
}

const db = new Dexie("ChatDatabase") as Dexie & {
  chats: EntityTable<Chat, "id">;
  messages: EntityTable<Message, "id">;
};

// Schema declaration:
db.version(1).stores({
  chats: "++id, title, createdAt",
  messages: "++id, chatId, role, createdAt, responseId",
});

export type { Chat, Message };
export { db };
