"use client";

import { useState } from "react";
import { sendChat, normalizeBoard, type ApiChatRequest } from "@/lib/api";
import { type BoardData } from "@/lib/kanban";

type AIChatWidgetProps = {
  board: BoardData;
  onApplyUpdates: (updates: BoardData) => void;
};

const boardToApiPayload = (board: BoardData) => ({
  id: 1,
  title: "User Board",
  columns: board.columns.map((column, columnIndex) => ({
    id: column.id,
    title: column.title,
    position: columnIndex,
    cards: column.cardIds.map((cardId, cardIndex) => ({
      id: cardId,
      title: board.cards[cardId]?.title ?? "",
      details: board.cards[cardId]?.details ?? "",
      position: cardIndex,
    })),
  })),
});

export const AIChatWidget = ({ board, onApplyUpdates }: AIChatWidgetProps) => {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const request: ApiChatRequest = {
        prompt: trimmed,
        history,
        board: boardToApiPayload(board),
      };

      const response = await sendChat(request);
      setReply(response.reply);
      setHistory((prev) => [...prev, `Q: ${trimmed}`, `A: ${response.reply}`]);

      if (response.updates) {
        try {
          const normalized = normalizeBoard(response.updates);
          onApplyUpdates(normalized);
        } catch (err) {
          console.warn("Could not apply AI updates", err);
        }
      }

      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown AI error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="absolute right-6 top-16 z-10 w-[360px] rounded-3xl border border-[var(--stroke)] bg-white p-4 shadow-[var(--shadow)]">
      <h2 className="text-sm font-semibold text-[var(--navy-dark)]">AI Chat</h2>
      <p className="mb-2 text-xs text-[var(--gray-text)]">Ask AI to adjust your board.</p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="mb-2 h-24 w-full rounded-lg border p-2 text-sm"
        placeholder="e.g. Move 2 cards from Backlog to In Progress"
        aria-label="AI prompt"
      />
      <button
        type="button"
        className="mb-3 w-full rounded-full bg-[var(--primary-blue)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? "Talking to AI..." : "Send to AI"}
      </button>

      {reply ? (
        <div className="mb-2 rounded-lg border border-[var(--stroke)] bg-[var(--surface)] p-2 text-xs">
          <strong>Reply:</strong> {reply}
        </div>
      ) : null}

      {error ? (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          Error: {error}
        </div>
      ) : null}

      <div className="h-24 overflow-auto rounded-lg border border-[var(--stroke)] bg-[var(--surface)] p-2 text-xs">
        {history.length ? history.map((item, index) => <div key={index}>{item}</div>) : <p className="text-[var(--gray-text)]">No conversation yet.</p>}
      </div>
    </aside>
  );
};
