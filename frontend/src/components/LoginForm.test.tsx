import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/LoginForm";

describe("LoginForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs in with correct credentials", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true, message: "Login successful" }),
      }) as Response
    ));

    const onLoginSuccess = vi.fn();
    render(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await userEvent.type(screen.getByLabelText(/username/i), "user");
    await userEvent.type(screen.getByLabelText(/password/i), "password");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalled());
    expect(screen.queryByText(/invalid username or password/i)).not.toBeInTheDocument();
  });

  it("shows error for wrong credentials", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false }) as Response
    ));

    const onLoginSuccess = vi.fn();
    render(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await userEvent.type(screen.getByLabelText(/username/i), "wrong");
    await userEvent.type(screen.getByLabelText(/password/i), "incorrect");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
    );
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });
});
