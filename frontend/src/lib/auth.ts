const AUTH_KEY = "kanban-auth";

export const getStoredAuth = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
};

export const setStoredAuth = (value: boolean) => {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(AUTH_KEY, "true");
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};

export const login = async (username: string, password: string) => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setStoredAuth(false);
      return false;
    }

    const data = await response.json();
    const success = data?.success === true;

    setStoredAuth(success);
    return success;
  } catch (error) {
    console.error("Login failed", error);
    setStoredAuth(false);
    return false;
  }
};

export const logout = () => {
  setStoredAuth(false);
};
