import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "advisor_chat_history";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setMessages(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }

  async function saveHistory(msgs: ChatMessage[]) {
    // Keep last 50 messages to avoid storage bloat
    const toSave = msgs.slice(-50);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }

  const sendMessage = useCallback(
    async (text: string, trpcMutate: (input: { messages: { role: string; content: string }[] }) => Promise<{ reply: string }>) => {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      const updated = [...messages, userMsg];
      setMessages(updated);
      setIsLoading(true);
      setError(null);

      try {
        // Build conversation history for API (last 10 messages for context)
        const historyForApi = updated.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const result = await trpcMutate({ messages: historyForApi });

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: result.reply,
          timestamp: Date.now(),
        };

        const finalMessages = [...updated, assistantMsg];
        setMessages(finalMessages);
        await saveHistory(finalMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "请求失败，请重试");
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const clearHistory = useCallback(async () => {
    setMessages([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
  };
}
