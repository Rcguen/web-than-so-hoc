import { useState } from "react";
import "./floatingChat.css";
import ChatbotWindow from "./ChatbotWindow";
import AdminChatWindow from "./AdminChatWindow";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // bot | admin

  return (
    <>
      {/* Chat windows */}
      {open && mode === "bot" && (
        <ChatbotWindow onClose={() => setOpen(false)} />
      )}

      {open && mode === "admin" && (
        <AdminChatWindow onClose={() => setOpen(false)} />
      )}

      {/* Floating buttons */}
      <div className="floating-container">
        {open && (
          <>
            <button
              className="floating-sub bot"
              onClick={() => setMode("bot")}
            >
              🤖
            </button>

            <button
              className="floating-sub admin"
              onClick={() => setMode("admin")}
            >
              👨‍💼
            </button>
          </>
        )}

        <button
          className="floating-main"
          onClick={() => {
            setOpen(!open);
            setMode(null);
          }}
        >
          💬
        </button>
      </div>
    </>
  );
}
