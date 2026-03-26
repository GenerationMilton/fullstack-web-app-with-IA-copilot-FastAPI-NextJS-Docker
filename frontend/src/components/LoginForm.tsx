"use client";

import { FormEvent, useState } from "react";
import { login } from "@/lib/auth";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(username.trim(), password);
    setIsLoading(false);

    if (success) {
      onLoginSuccess();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-[var(--stroke)] bg-white p-8 shadow-[var(--shadow)]">
      <h2 className="text-2xl font-semibold text-[var(--navy-dark)]">Login</h2>
      <p className="mb-6 text-sm text-[var(--gray-text)]">Use user/password to sign in.</p>
      <form onSubmit={handleSubmit}>
        <label className="block mb-3" htmlFor="username">
          <span className="text-sm font-medium">Username</span>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            required
          />
        </label>
        <label className="block mb-3" htmlFor="password">
          <span className="text-sm font-medium">Password</span>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-[var(--primary-blue)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#127abf]"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
};
