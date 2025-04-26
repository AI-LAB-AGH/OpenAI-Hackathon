"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Link from "next/link";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";

interface RecentChat {
  id: number;
  title: string;
  lastMessage: string;
  updatedAt: Date;
}

export default function RecentChats() {
  const recentChats =
    useLiveQuery(async () => {
      const chats = await db.chats
        .orderBy("createdAt")
        .reverse()
        .limit(3)
        .toArray();

      const chatsWithLastMessage = await Promise.all(
        chats.map(async (chat) => {
          const lastMessage = await db.messages
            .where("chatId")
            .equals(chat.id)
            .last();

          return {
            id: chat.id,
            title: chat.title,
            lastMessage: lastMessage?.content || "No messages yet",
            updatedAt: chat.createdAt,
          };
        })
      );

      return chatsWithLastMessage;
    }) || [];

  if (recentChats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recentChats.map((chat) => (
        <Link href={`/chat?chatId=${chat.id}`} key={chat.id}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-amber-400" />
              <CardTitle className="text-base line-clamp-1">
                {chat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2">
                {chat.lastMessage}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(chat.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
