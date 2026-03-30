"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/KanbanColumn";
import { KanbanCardPreview } from "@/components/KanbanCardPreview";
import {
  createId,
  initialData,
  moveCard,
  type BoardData,
} from "@/lib/kanban";
import { fetchBoard, saveBoard, sendChat, normalizeBoard, type ApiChatResponse } from "@/lib/api";

interface KanbanBoardProps {
  onLogout?: () => void;
}

export const KanbanBoard = ({ onLogout }: KanbanBoardProps) => {
  const [board, setBoard] = useState<BoardData>(() => initialData);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiHistory, setAiHistory] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReply, setAiReply] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const remoteBoard = await fetchBoard();
        if (mounted) {
          setBoard(remoteBoard);
        }
      } catch (err) {
        console.warn("Could not load board from backend, using local state", err);
        if (mounted) {
          setError("Could not load board from backend, using local fallback.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const persistBoard = async (nextBoard: BoardData) => {
    try {
      await saveBoard(nextBoard);
      setError("");
    } catch (err) {
      console.error("Failed to sync board", err);
      setError("Failed to save board updates. Changes are local only.");
    }
  };

  const boardToApiPayload = () => ({
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

  const applyBoardUpdates = async (updates: { columns: any[] } | undefined) => {
    if (!updates || !Array.isArray(updates.columns)) {
      return;
    }

    try {
      const normalized = normalizeBoard({
        id: 1,
        title: "User Board",
        columns: updates.columns,
      });

      setBoard(normalized);
      await persistBoard(normalized);
    } catch (err) {
      console.warn("Invalid AI board updates, ignoring", err);
    }
  };

  const handleAiQuery = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) return;

    setAiLoading(true);
    setError("");

    try {
      const response = await sendChat({
        prompt,
        history: aiHistory,
        board: boardToApiPayload(),
      });

      setAiReply(response.reply);
      setAiHistory((prev) => [...prev, `Q: ${prompt}`, `A: ${response.reply}`]);
      setAiPrompt("");

      if (response.updates) {
        await applyBoardUpdates(response.updates);
      }
    } catch (err) {
      console.error("AI query failed", err);
      setError(
        err instanceof Error
          ? `AI query failed: ${err.message}`
          : "AI query failed"
      );
    } finally {
      setAiLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const cardsById = useMemo(() => board.cards, [board.cards]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const nextBoard = {
      ...board,
      columns: moveCard(board.columns, active.id as string, over.id as string),
    };

    setBoard(nextBoard);
    persistBoard(nextBoard);
  };

  const handleRenameColumn = (columnId: string, title: string) => {
    const nextBoard = {
      ...board,
      columns: board.columns.map((column) =>
        column.id === columnId ? { ...column, title } : column
      ),
    };

    setBoard(nextBoard);
    persistBoard(nextBoard);
  };

  const handleAddCard = (columnId: string, title: string, details: string) => {
    const id = createId("card");
    const nextBoard: BoardData = {
      ...board,
      cards: {
        ...board.cards,
        [id]: { id, title, details: details || "No details yet." },
      },
      columns: board.columns.map((column) =>
        column.id === columnId
          ? { ...column, cardIds: [...column.cardIds, id] }
          : column
      ),
    };

    setBoard(nextBoard);
    persistBoard(nextBoard);
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    const nextBoard: BoardData = {
      ...board,
      cards: Object.fromEntries(
        Object.entries(board.cards).filter(([id]) => id !== cardId)
      ),
      columns: board.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cardIds: column.cardIds.filter((id) => id !== cardId),
            }
          : column
      ),
    };

    setBoard(nextBoard);
    persistBoard(nextBoard);
  };

  const activeCard = activeCardId ? cardsById[activeCardId] : null;

  if (isLoading) {
    return <div className="mt-16 text-center">Loading board...</div>;
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.25)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.18)_0%,_rgba(117,57,145,0.05)_55%,_transparent_75%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-[1500px] flex-col gap-10 px-6 pb-16 pt-12">
        <header className="flex flex-col gap-6 rounded-[32px] border border-[var(--stroke)] bg-white/80 p-8 shadow-[var(--shadow)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
                Single Board Kanban
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--navy-dark)]">
                Kanban Studio
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--gray-text)]">
                Keep momentum visible. Rename columns, drag cards between stages,
                and capture quick notes without getting buried in settings.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--gray-text)]">Logged in as user</span>
                {onLogout ? (
                  <button
                    type="button"
                    className="rounded-full border border-[var(--stroke)] px-3 py-1 text-xs font-semibold text-[var(--navy-dark)] transition hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)]"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                ) : null}
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]">
                  Focus
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--primary-blue)]">
                  One board. Five columns. Zero clutter.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {board.columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-2 rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy-dark)]"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--accent-yellow)]" />
                {column.title}
              </div>
            ))}
          </div>
        </header>

        {error ? (
          <div className="mx-auto mb-4 max-w-5xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mx-auto mb-4 max-w-5xl rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-[var(--shadow)]">
          <h2 className="text-sm font-semibold text-[var(--navy-dark)]">AI Assistant</h2>
          <p className="mb-2 text-xs text-[var(--gray-text)]">
            Ask the AI to suggest changes for your board. Replies may include structured updates.
          </p>
          <div className="flex flex-col gap-2">
            <textarea
              className="min-h-[72px] w-full rounded-lg border p-2"
              value={aiPrompt}
              placeholder="Try: Move 2 cards from Backlog to In Progress"
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-full bg-[var(--primary-blue)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                disabled={aiLoading}
                onClick={handleAiQuery}
              >
                {aiLoading ? "Asking AI..." : "Ask AI"}
              </button>
              <span className="text-xs text-[var(--gray-text)]">
                {aiHistory.length} messages in history
              </span>
            </div>
            {aiReply ? (
              <div className="rounded-lg border border-[var(--stroke)] bg-[var(--surface)] p-3 text-sm">
                <strong>AI:</strong> {aiReply}
              </div>
            ) : null}
          </div>
        </section>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <section className="grid gap-6 lg:grid-cols-5">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={column.cardIds.map((cardId) => board.cards[cardId])}
                onRename={handleRenameColumn}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </section>
          <DragOverlay>
            {activeCard ? (
              <div className="w-[260px]">
                <KanbanCardPreview card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};
