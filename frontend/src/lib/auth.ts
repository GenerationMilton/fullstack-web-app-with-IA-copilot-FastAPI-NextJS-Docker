const AUTH_KEY = "kanban-auth";
const VALID_USERNAME = "user";
const VALID_PASSWORD = "password";

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
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    setStoredAuth(true);
    return true;
  }

  setStoredAuth(false);
  return false;
};

export const logout = () => {
  setStoredAuth(false);
};
