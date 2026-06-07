"use client";

import { useTheme } from "next-themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * App-wide container for system messages (react-toastify). Rendered once in the
 * root layout; emit messages from anywhere with `toast(...)` from `react-toastify`.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      autoClose={4000}
      newestOnTop
    />
  );
}
