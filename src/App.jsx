
import { useEffect } from "react";
import "./App.css";
import AppRouter from "./app/Router";
import { useAuthStore } from "./stores/authStore";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <AppRouter />;
}

export default App;
