import type { BoardData, Card, Column } from "@/lib/kanban";

export type ApiCard = {
  id: string;
  title: string;
  details: string;
  position: number;
};

export type ApiColumn = {
  id: string;
  title: string;
  position: number;
  cards: ApiCard[];
};

export type ApiBoardResponse = {
  id: number;
  title: string;
  columns: ApiColumn[];
};

export type ApiChatRequest = {
  prompt: string;
  history: string[];
  board?: ApiBoardResponse;
};

export type ApiChatResponse = {
  model: string;
  reply: string;
  updates?: ApiBoardResponse;
};

export const normalizeBoard = (payload: ApiBoardResponse): BoardData => {
  const columns: Column[] = payload.columns
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((column) => ({
      id: column.id,
      title: column.title,
      cardIds: column.cards
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((card) => card.id),
    }));

  const cards: Record<string, Card> = {};
  payload.columns.forEach((column) => {
    column.cards.forEach((card) => {
      cards[card.id] = {
        id: card.id,
        title: card.title,
        details: card.details,
      };
    });
  });

  return { columns, cards };
};

export const buildBoardUpdatePayload = (board: BoardData) => {
  const columns: ApiColumn[] = board.columns.map((column, index) => ({
    id: column.id,
    title: column.title,
    position: index,
    cards: column.cardIds.map((cardId, cardIndex) => {
      const card = board.cards[cardId];
      return {
        id: card.id,
        title: card.title,
        details: card.details,
        position: cardIndex,
      };
    }),
  }));

  const cardsMap: Record<string, ApiCard> = {};
  columns.forEach((column) => {
    column.cards.forEach((card) => {
      cardsMap[card.id] = card;
    });
  });

  return {
    columns,
    cards: cardsMap,
  };
};

export const fetchBoard = async (): Promise<BoardData> => {
  const response = await fetch("/api/board", { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to load board");
  }
  const data = (await response.json()) as ApiBoardResponse;
  return normalizeBoard(data);
};

export const saveBoard = async (board: BoardData): Promise<void> => {
  const payload = buildBoardUpdatePayload(board);
  const response = await fetch("/api/board", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to save board");
  }
};

export const sendChat = async (request: ApiChatRequest): Promise<ApiChatResponse> => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Chat request failed: ${response.status} ${errText}`);
  }

  return (await response.json()) as ApiChatResponse;
};
