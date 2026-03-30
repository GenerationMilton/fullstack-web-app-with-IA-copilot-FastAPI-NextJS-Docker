import { buildBoardUpdatePayload, normalizeBoard } from "@/lib/api";

describe("API board helpers", () => {
  it("normalizes board response to internal board data", () => {
    const response = {
      id: 1,
      title: "board",
      columns: [
        {
          id: "col-1",
          title: "Col 1",
          position: 0,
          cards: [
            { id: "c1", title: "Card 1", details: "d1", position: 0 },
            { id: "c2", title: "Card 2", details: "d2", position: 1 },
          ],
        },
      ],
    };

    const result = normalizeBoard(response);

    expect(result.columns).toHaveLength(1);
    expect(result.columns[0].cardIds).toEqual(["c1", "c2"]);
    expect(result.cards.c1.title).toBe("Card 1");
  });

  it("builds an update payload from board data", () => {
    const boardData = {
      columns: [{ id: "col-1", title: "Col 1", cardIds: ["c1"] }],
      cards: { c1: { id: "c1", title: "Card 1", details: "d1" } },
    };

    const payload = buildBoardUpdatePayload(boardData);

    expect(Object.keys(payload.cards)).toContain("c1");
    expect(payload.columns[0].cards[0].id).toBe("c1");
  });
});