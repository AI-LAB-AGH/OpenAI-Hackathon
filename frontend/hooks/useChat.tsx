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

export function useStreamingChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  const sendMessage = async (
    messageText: string,
    chatId: number,
    previousResponseId: string | null,
    onStreamComplete: (finalMessage: string) => void
  ) => {
    setIsLoading(true);
    setStreamingMessage("");

    try {
      // Add user message to database
      await db.messages.add({
        chatId,
        role: "user",
        content: messageText,
        createdAt: new Date(),
      });

      // Create a temporary message for streaming
      const tempMessageId = await db.messages.add({
        chatId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      });

      const eventSource = new EventSource(
        `${API_URL}/chat/stream?message=${encodeURIComponent(messageText)}`
      );

      let fullMessage = "";

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const chunk = data.content;
        fullMessage += chunk;
        setStreamingMessage(fullMessage);
      };

      eventSource.onerror = async () => {
        eventSource.close();
        setIsLoading(false);
        
        // Update the temporary message with the full content
        await db.messages.update(tempMessageId, {
          content: fullMessage,
        });
        
        onStreamComplete(fullMessage);
      };
    } catch (error) {
      await db.messages.add({
        chatId,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        createdAt: new Date(),
      });
      setIsLoading(false);
    }
  };

  return { isLoading, streamingMessage, sendMessage };
}
