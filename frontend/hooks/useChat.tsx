import { useState } from "react";
import { db } from "@/db/db";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (
    messageText: string,
    chatId: number,
    previousResponseId: string | null
  ) => {
    setIsLoading(true);

    try {
      // Add user message to database
      await db.messages.add({
        chatId,
        role: "user",
        content: messageText,
        createdAt: new Date(),
      });

      const response = await axios.post(`${API_URL}/chat`, {
        message: messageText,
        previousResponseId,
      });

      console.log(response);

      // Add assistant's response to database
      await db.messages.add({
        chatId,
        role: "assistant",
        content: response.data,
        createdAt: new Date(),
      });
    } catch (error) {
      await db.messages.add({
        chatId,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        createdAt: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, sendMessage };
}
