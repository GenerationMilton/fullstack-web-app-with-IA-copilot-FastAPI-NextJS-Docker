import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIChatWidget } from "@/components/AIChatWidget";

const dummyBoard = {
  columns: [
    { id: "col-backlog", title: "Backlog", cardIds: ["card-1"] },
    { id: "col-done", title: "Done", cardIds: [] },
  ],
  cards: { "card-1": { id: "card-1", title: "Item", details: "Item details" } },
};

describe("AIChatWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn((url, options) => {
      if (url === "/api/chat" && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            model: "openai/gpt-oss-120b",
            reply: "OK",
            updates: {
              id: 1,
              title: "My Kanban Board",
              columns: [
                { id: "col-backlog", title: "Backlog", position: 0, cards: [] },
                { id: "col-done", title: "Done", position: 1, cards: [{ id: "card-1", title: "Item", details: "Item details", position: 0 }] },
              ],
            },
          }),
        }) as Response;
      }
      return Promise.reject(new Error("Unhandled fetch"));
    }) as any);
  });

  it("shows AI reply and applies updates via callback", async () => {
    const onApplyUpdates = vi.fn();

    render(<AIChatWidget board={dummyBoard} onApplyUpdates={onApplyUpdates} />);

    await userEvent.type(screen.getByRole("textbox", { name: /AI prompt/i }), "Move card to Done");
    await userEvent.click(screen.getByRole("button", { name: /send to ai/i }));

    await waitFor(() => expect(screen.getByText(/reply:/i)).toBeInTheDocument());
    expect(screen.getAllByText(/OK/i).length).toBeGreaterThan(0);
    expect(onApplyUpdates).toHaveBeenCalled();
  });
});
