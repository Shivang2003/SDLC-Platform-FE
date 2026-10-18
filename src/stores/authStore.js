
import { create } from "zustand";

const getInitialToken = () => localStorage.getItem("accessToken");

export const useAuthStore = create((set) => ({
  token: getInitialToken(),

  login: (token) => {
    localStorage.setItem("accessToken", token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    set({ token: null });
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "accessToken") {
      useAuthStore.setState({ token: event.newValue });
    }
  });

  window.addEventListener("auth:unauthorized", () => {
    useAuthStore.getState().logout();
  });
}
