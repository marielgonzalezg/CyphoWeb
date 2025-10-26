"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, User, Loader2, TrendingUp, DollarSign, PiggyBank, CreditCard } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const COLORS = {
  primary: "#FE0024",
  text: "#777777",
  white: "#FFFFFF",
  muted: "#DDDDDD",
  lightGray: "#F5F5F5",
  darkRed: "#C4001C",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const prompt = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`La API devolvió HTML en lugar de JSON. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      const assistantReply = typeof data?.response === "string" ? data.response : responseText;
      setMessages((prev) => [...prev, { role: "assistant", content: assistantReply }]);

    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${error.message}\n\nPor favor, intenta de nuevo más tarde.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestedQuestions = [
    { icon: TrendingUp, text: "¿Cómo puedo mejorar mis finanzas?", color: COLORS.primary },
    { icon: PiggyBank, text: "Consejos para ahorrar dinero", color: "#FF4D68" },
    { icon: CreditCard, text: "Quiero crear un", color: COLORS.darkRed },
    { icon: DollarSign, text: "Opciones de inversión", color: "#C4001C" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FE0024] to-[#C4001C] rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#FE0024]">
                Coach Financiero Banorte
              </h1>
              <p className="text-sm text-[#777777] font-semibold">Tu asistente inteligente para finanzas personales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-36 sm:px-6">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FE0024] to-[#C4001C] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <MessageCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-3">
              ¡Hola! Soy tu Coach Financiero
            </h2>
            <p className="text-lg text-[#777777] mb-8 font-semibold">
              Estoy aquí para ayudarte con tus finanzas personales
            </p>

            {/* Suggested Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q.text)}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-[#DDDDDD] hover:border-[#FE0024] hover:shadow-md transition-all text-left group"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: q.color }}
                  >
                    <q.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-[#777777] group-hover:text-[#FE0024]">
                    {q.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 mb-6 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-10 h-10 bg-gradient-to-br from-[#FE0024] to-[#C4001C] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#FE0024] to-[#C4001C] text-white"
                  : "bg-white text-gray-800 border border-gray-100"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed font-medium">
                {msg.content}
              </p>
            </div>

            {msg.role === "user" && (
              <div className="w-10 h-10 bg-[#DDDDDD] rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-[#777777]" strokeWidth={2.5} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FE0024] to-[#C4001C] rounded-xl flex items-center justify-center shadow-md">
              <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="bg-white shadow-md rounded-2xl px-5 py-4 border border-gray-100">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-[#FE0024] animate-spin" strokeWidth={2.5} />
                <span className="text-[#777777] font-semibold text-sm">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta sobre finanzas..."
              disabled={isLoading}
              className="flex-1 px-5 py-4 rounded-2xl border-2 border-[#DDDDDD] focus:border-[#FE0024] focus:ring-4 focus:ring-red-50 outline-none disabled:bg-gray-50 disabled:text-gray-400 font-medium text-gray-800 placeholder:text-gray-400"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-[#FE0024] to-[#C4001C] text-white rounded-2xl font-black hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
              ) : (
                <Send className="w-5 h-5" strokeWidth={2.5} />
              )}
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
          
          {/* Info footer */}
          <div className="text-center mt-3">
            <p className="text-xs text-[#777777]">
              Este asistente usa IA para brindarte información. Verifica siempre con un asesor financiero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}