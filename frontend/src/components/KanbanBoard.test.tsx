import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "@/components/KanbanBoard";

const getFirstColumn = async () => (await screen.findAllByTestId(/column-/i))[0];

describe("KanbanBoard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn((url) => {
      if (url === "/api/board") {
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

      if (url === "/api/board" && typeof (globalThis.fetch as any).mockImplementationOnce === "function") {
        return Promise.resolve({ ok: true }) as Response;
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
});
