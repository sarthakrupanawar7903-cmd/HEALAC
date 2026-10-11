"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { sendChatMessage } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(
        "mock_abha_12345",
        newMessages.map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the server. Make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">AI Health Chat</h1>
        <p className="text-gray-500 text-sm">
          Describe your symptoms. HEALAC will ask follow-up questions and
          suggest possibilities.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
            <Sparkles
              size={32}
              className="text-teal-700 mx-auto mb-3"
            />
            <div className="text-gray-700 font-medium mb-1">
              Hi, I'm HEALAC.
            </div>
            <div className="text-sm text-gray-500">
              Tell me what's bothering you — for example, "I have a fever" or
              "I've been feeling tired."
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-lg p-4 rounded-2xl whitespace-pre-line ${
                m.role === "user"
                  ? "bg-teal-700 text-white"
                  : "bg-white border border-gray-100 text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 size={16} className="animate-spin" /> HEALAC is
              thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
        <input
          className="flex-1 px-4 py-2 outline-none bg-transparent"
          placeholder="Describe your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-teal-700 text-white p-3 rounded-xl hover:bg-teal-800 disabled:opacity-50 transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}