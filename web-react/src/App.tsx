import { useCallback, useState } from "react";
import { getStoredToken, logout as clearToken } from "./api/backlogApi";
import LoginPage from "./pages/LoginPage";
import BacklogPage from "./pages/BacklogPage";
import "./styles/backlog.css";

export default function App() {
  const [authed, setAuthed] = useState<boolean>(() => getStoredToken() !== null);

  const handleLoggedIn = useCallback(() => setAuthed(true), []);
  const handleLogout = useCallback(() => {
    clearToken();
    setAuthed(false);
  }, []);

  if (!authed) {
    return <LoginPage onLoggedIn={handleLoggedIn} />;
  }
  return <BacklogPage onLogout={handleLogout} />;
}
