import { useState } from "react";
import UnifiedChatWindow from "./UnifiedChatWindow";
import "./floatingChat.css";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <UnifiedChatWindow onClose={() => setOpen(false)} />}

      <button className="floating-btn" onClick={() => setOpen(true)}>
        💬
      </button>
    </>
  );
}
