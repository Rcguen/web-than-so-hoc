import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import ChatbotIcon from "./ChatbotIcon.jsx"

const ChatMessage = ({ chat }) => {
  return (
    <div className={`message ${chat.role === "model" ? 'bot' : 'user'}-message`}>
      {chat.role === "model" && <ChatbotIcon />}
      <div className="message-text">
        <ReactMarkdown
          // Allow raw HTML if you really need it; otherwise omit rehypeRaw
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
            // You can override any element here (e.g. add classes):
            ul: ({ node, ...props }) => <ul className="my-list" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
            // etc.
          }}
        >
          {chat.text || ''}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default ChatMessage
