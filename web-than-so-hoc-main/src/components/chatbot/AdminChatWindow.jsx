export default function AdminChatWindow({ onClose }) {
  return (
    <div className="chat-window">
      <div className="chat-header">
        👨‍💼 Chat với Admin
        <button onClick={onClose}>✖</button>
      </div>

      <div className="chat-body">
        <div className="msg bot">
          Admin sẽ phản hồi trong giờ hành chính 😊
        </div>
      </div>

      <div className="chat-input">
        <input placeholder="Nhập tin nhắn..." disabled />
        <button disabled>Gửi</button>
      </div>
    </div>
  );
}
