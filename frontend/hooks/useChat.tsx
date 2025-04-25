import { useState } from "react";
import { db } from "@/db/db";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");

  const sendStreamedMessage = async (
    messageText: string,
    chatId: number,
    previousResponseId: string | null
  ) => {
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Add user message to database
      await db.messages.add({
        chatId,
        role: "user",
        content: messageText,
        createdAt: new Date(),
      });

      // Create a placeholder for the assistant's response that will be updated
      const assistantMessageId = await db.messages.add({
        chatId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      });

      const response = await fetch(`${API_URL}/chat-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          previousResponseId,
        }),
      });

      if (!response.ok) throw new Error("Error");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is null");

      const decoder = new TextDecoder();
      let fullResponse = "";
      let responseId = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split(`\n`);

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            const jsonData = JSON.parse(data);

            if (jsonData.type === "final" && jsonData.responseId) {
              responseId = jsonData.responseId;
              continue;
            }

            if (jsonData.type === "message" && jsonData.delta) {
              fullResponse += jsonData.delta;
              setStreamingContent(fullResponse);

              // Update the database with the current content
              await db.messages.update(assistantMessageId, {
                content: fullResponse,
              });
            }
          }
        }
      }

      // Final update with responseId
      if (responseId) {
        await db.messages.update(assistantMessageId, {
          responseId,
        });
      }
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message to the database
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

  const sendMessage = async (
    messageText: string,
    chatId: number,
    previousResponseId: string | null
  ) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: messageText,
        previousResponseId,
      });
      const responseText = response.data.output[0].content[0].text;
      await db.messages.add({
        chatId,
        responseId: response.data.id,
        role: "assistant",
        content: responseText,
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

  return { isLoading, streamingContent, sendStreamedMessage, sendMessage };
}
