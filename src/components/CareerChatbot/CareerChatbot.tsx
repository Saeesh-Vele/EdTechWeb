import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { generateChatbotResponse } from "../../utils/gemini";

export default function CareerChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi! I’m your Smart EdTech Assistant. I help you identify learning gaps and guide you with structured roadmaps 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (msg?: string) => {
    const userMessage = msg || input;
    if (!userMessage) return;

    const newMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await generateChatbotResponse(userMessage);
      setMessages([...newMessages, { role: "bot", text: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "bot", text: "⚠ Error connecting to assistant." },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-[1000]"
        style={{ backgroundColor: "oklch(0.637 0.237 275)" }}
      >
        {open ? <X className="text-white" /> : <MessageCircle className="text-white" />}
      </button>

      {/* Chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-[1000]"
          >
            {/* Header */}
            <div className="p-3 text-white flex justify-between items-center"
              style={{ backgroundColor: "oklch(0.637 0.237 275)" }}>
              <h2>Smart Assistant</h2>
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : ""}>
                  <div className="inline-block p-2 rounded-xl m-1"
                    style={{
                      background: m.role === "user"
                        ? "oklch(0.637 0.237 275)"
                        : "#eee",
                      color: m.role === "user" ? "white" : "black"
                    }}>
                    {m.role === "bot" ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
                  </div>
                </div>
              ))}
              {loading && <Loader2 className="animate-spin" />}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="p-2 flex flex-wrap gap-2">
              {[
                "Why am I struggling with coding?",
                "Backend roadmap",
                "How to start AI?",
                "React prerequisites"
              ].map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="text-xs px-2 py-1 rounded bg-purple-500 text-white">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex p-2 border-t">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border px-2"
                placeholder="Ask your learning question..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={() => sendMessage()}
                className="px-3 bg-purple-500 text-white">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
