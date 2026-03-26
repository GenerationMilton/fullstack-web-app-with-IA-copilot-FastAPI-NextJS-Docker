"use client";

import { useEffect, useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LoginForm } from "@/components/LoginForm";
import { getStoredAuth, logout } from "@/lib/auth";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    setAuthenticated(getStoredAuth());
    setCheckedAuth(true);
  }, []);

  if (!checkedAuth) {
    return <div className="mt-16 text-center">Checking authentication...</div>;
  }

  if (!authenticated) {
    return <LoginForm onLoginSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div>
      <KanbanBoard
        onLogout={() => {
          logout();
          setAuthenticated(false);
        }}
      />
    </div>
  );
}
