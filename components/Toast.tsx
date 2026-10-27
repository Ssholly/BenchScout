"use client";
import { createPortal } from "react-dom";

type ToastProps = { message: string; type: "success" | "error" | "warning" };
export default function Toast({ message, type }: ToastProps) {
  return createPortal(
    <div className={`app-toast app-toast-${type}`} role={type === "error" ? "alert" : "status"}>
      <span className="app-toast-icon" aria-hidden="true">{type === "success" ? "✓" : type === "warning" ? "!" : "×"}</span>
      <span className="app-toast-message">{message}</span>
    </div>, document.body,
  );
}
