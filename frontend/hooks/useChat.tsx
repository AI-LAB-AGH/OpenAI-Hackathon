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

      const response = await fetch(`${API_URL}/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          previousResponseId: previousResponseId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullMessage = "";

      if (!reader) {
        throw new Error('No reader available');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.type === "message") {
                fullMessage += data.content;
                setStreamingMessage(fullMessage);
              } else if (data.type === "final") {
                setIsLoading(false);
                await db.messages.update(tempMessageId, {
                  content: fullMessage,
                });
                onStreamComplete(fullMessage);
                return;
              } else if (data.type === "error") {
                throw new Error(data.content);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        setIsLoading(false);
        await db.messages.update(tempMessageId, {
          content: fullMessage || "Sorry, there was an error processing your request.",
        });
        onStreamComplete(fullMessage || "Sorry, there was an error processing your request.");
      }
    } catch (error) {
      console.error('Error in streaming chat:', error);
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
