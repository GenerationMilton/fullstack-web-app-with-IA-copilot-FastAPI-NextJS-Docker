import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "@/components/KanbanBoard";

const getFirstColumn = async () => (await screen.findAllByTestId(/column-/i))[0];

describe("KanbanBoard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn((url, options) => {
      if (url === "/api/board" && (!options || options.method === "GET")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 1,
            title: "My Kanban Board",
            columns: [
              {
                id: "col-backlog",
                title: "Backlog",
                position: 0,
                cards: [
                  { id: "card-1", title: "One", details: "x", position: 0 },
                ],
              },
              { id: "col-done", title: "Done", position: 1, cards: [] },
            ],
          }),
        }) as Response;
      }

      if (url === "/api/board" && options?.method === "PUT") {
        return Promise.resolve({ ok: true }) as Response;
      }

      if (url === "/api/chat" && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            model: "openai/gpt-oss-120b",
            reply: "AI update applied",
            updates: {
              id: 1,
              title: "My Kanban Board",
              columns: [
                {
                  id: "col-backlog",
                  title: "Backlog",
                  position: 0,
                  cards: [],
                },
                {
                  id: "col-done",
                  title: "Done",
                  position: 1,
                  cards: [{ id: "card-1", title: "One", details: "x", position: 0 }],
                },
              ],
            },
          }),
        }) as Response;
      }

      return Promise.reject(new Error("Unhandled fetch"));
    }) as any);
  });

  it("renders two columns", async () => {
    render(<KanbanBoard />);
    expect(await screen.findAllByTestId(/column-/i)).toHaveLength(2);
  });

  it("renames a column", async () => {
    render(<KanbanBoard />);
    const column = await getFirstColumn();
    const input = within(column).getByLabelText("Column title");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    await waitFor(() => expect(input).toHaveValue("New Name"));
  });

  it("adds and removes a card", async () => {
    render(<KanbanBoard />);
    const column = await getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /add a card/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(within(column).getByRole("button", { name: /add card/i }));

    await waitFor(() => expect(within(column).getByText("New card")).toBeInTheDocument());

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    expect(within(column).queryByText("New card")).not.toBeInTheDocument();
  });

  it("calls onLogout when logout button is clicked", async () => {
    const onLogout = vi.fn();
    render(<KanbanBoard onLogout={onLogout} />);
    await screen.findAllByTestId(/column-/i);
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await userEvent.click(logoutButton);
    expect(onLogout).toHaveBeenCalled();
  });

  it("can ask AI and apply board updates", async () => {
    render(<KanbanBoard />);
    await screen.findAllByTestId(/column-/i);

    await userEvent.type(
      screen.getByRole("textbox", { name: /AI prompt/i }),
      "Move card-1 to Done"
    );

    await userEvent.click(screen.getByRole("button", { name: /send to ai/i }));

    await waitFor(() => expect(screen.getByText(/AI update applied/i)).toBeInTheDocument());

    expect(screen.getAllByTestId(/column-/i)).toHaveLength(2);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });
});
