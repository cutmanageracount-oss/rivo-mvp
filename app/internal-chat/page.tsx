"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  text: string | null;
  createdAt: string;
};

export default function InternalChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMessages() {
    try {
      setLoading(true);
      const res = await fetch("/api/internal-chat");
      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.error || "Failed to load internal chat.");
      }

      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load internal chat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/internal-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        throw new Error(data.error || "Failed to send message.");
      }

      // After POST, reload full conversation to keep it simple
      await loadMessages();
      setInput("");
    } catch (err) {
      console.error(err);
      setError("Error while sending message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        maxWidth: "720px",
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
        Internal chat · Rivo
      </h1>
      <p style={{ marginBottom: "16px", color: "#555", fontSize: "14px" }}>
        Use this chat to simulate WhatsApp conversations for this garage. Later,
        AI flows (A/B/C + upsell) will run here before going live.
      </p>

      {error && (
        <p style={{ color: "red", fontSize: "14px", marginBottom: "8px" }}>
          {error}
        </p>
      )}

      <div
        style={{
          flex: 1,
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflowY: "auto",
          backgroundColor: "#fafafa",
          marginBottom: "12px",
        }}
      >
        {loading ? (
          <p style={{ fontSize: "14px", color: "#777" }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#777" }}>
            No messages yet. Type a message below to start a test conversation.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent:
                  msg.direction === "INBOUND" ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  border: "1px solid #ddd",
                  backgroundColor:
                    msg.direction === "INBOUND" ? "#ffffff" : "#0070f3",
                  color: msg.direction === "INBOUND" ? "#000" : "#fff",
                  fontSize: "14px",
                  whiteSpace: "pre-wrap",
                }}
              >
                <div style={{ marginBottom: "4px" }}>
                  {msg.text || "<no text>"}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                    textAlign:
                      msg.direction === "INBOUND" ? "left" : "right",
                  }}
                >
                  {msg.direction === "INBOUND" ? "Client" : "Rivo"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: I want a full interior cleaning for my G63."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "999px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          disabled={sending}
          style={{
            padding: "10px 16px",
            borderRadius: "999px",
            border: "none",
            fontSize: "14px",
            fontWeight: 500,
            backgroundColor: sending ? "#ccc" : "#0070f3",
            color: "#fff",
            cursor: sending ? "not-allowed" : "pointer",
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </main>
  );
}
