import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGroqChat, EnglishLevel, type Message } from "@/hooks/useGroqChat";
import { AccentGauge } from "@/components/AccentGauge";
import { 
  Send, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Trash2, 
  Bot, 
  User, 
  Sparkles,
  ChevronDown,
  Settings
} from "lucide-react";

interface AIChatProps {
  initialLevel?: EnglishLevel;
  compact?: boolean;
}

const levelOptions: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function LevelSelector({ 
  level, 
  onChange 
}: { 
  level: EnglishLevel; 
  onChange: (level: EnglishLevel) => void 
}) {
  return (
    <div className="flex items-center gap-2">
      <Settings size={14} className="text-zinc-500" />
      <select
        value={level}
        onChange={(e) => onChange(e.target.value as EnglishLevel)}
        className="bg-zinc-800 text-zinc-200 text-xs font-bold px-2 py-1 rounded-lg border border-zinc-700 focus:outline-none focus:border-indigo-500"
      >
        {levelOptions.map(l => (
          <option key={l} value={l}>Nivel {l}</option>
        ))}
      </select>
    </div>
  );
}

function SpeechInput({ 
  onSend, 
  disabled 
}: { 
  onSend: (text: string) => void; 
  disabled: boolean;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  const handleSend = () => {
    if (transcript.trim()) {
      onSend(transcript);
      setTranscript("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsListening(!isListening)}
        disabled={disabled}
        className={`p-2 rounded-lg transition-colors ${
          isListening 
            ? "bg-red-500/20 text-red-400 animate-pulse" 
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
        }`}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
      <div className="flex-1 relative">
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isListening ? "Escuchando..." : "Escribe tu mensaje..."}
          disabled={disabled}
          className="w-full bg-zinc-900 text-zinc-200 text-sm px-4 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
        />
        {transcript && (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-indigo-300"
          >
            <Send size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-md"
            : "bg-zinc-800 text-zinc-200 rounded-bl-md"
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && <Bot size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />}
          {isUser && <User size={16} className="text-white mt-0.5 flex-shrink-0" />}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function AIChat({ initialLevel = "B1", compact = false }: AIChatProps) {
  const [level, setLevel] = useState<EnglishLevel>(initialLevel);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    error,
    isSpeaking,
    currentRepeatPhrase,
    sendMessage,
    clearChat,
    speakText,
    stopSpeaking,
  } = useGroqChat({
    level,
    onSpeak: () => {},
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInputText("");
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-zinc-200">AI Tutor</span>
          </div>
          <LevelSelector level={level} onChange={setLevel} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-zinc-500 text-sm py-8">
              <Bot size={32} className="mx-auto mb-2 opacity-50" />
              <p>¡Hola! Soy tu tutor de inglés. ¿En qué nivel estás? {level}.</p>
              <p className="mt-2 text-xs">Conversa conmigo y practica tu pronunciación.</p>
            </div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-zinc-800">
          <SpeechInput onSend={handleSend} disabled={isLoading} />
        </div>

        {/* Repeat Phrase - Accent Gauge */}
        {currentRepeatPhrase && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Practica esta frase:</p>
            <AccentGauge targetText={currentRepeatPhrase} label="" compact />
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-950/90 rounded-2xl border border-zinc-800 shadow-2xl max-w-[420px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <Sparkles size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">AI English Tutor</h3>
            <p className="text-xs text-zinc-500">Powered by Llama 3 • Groq</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LevelSelector level={level} onChange={setLevel} />
          <button
            onClick={clearChat}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Limpiar chat"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-[300px] overflow-y-auto space-y-3 p-2 bg-zinc-900/50 rounded-xl">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <Bot size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">¡Bienvenido a tu clase de inglés!</p>
            <p className="text-xs mt-1">Nivel actual: <span className="text-indigo-400 font-bold">{level}</span></p>
            <p className="text-xs mt-3 text-zinc-600">Conversa conmigo y al final de cada respuesta tendrás una frase para practicar tu pronunciación.</p>
          </div>
        ) : null}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 px-4 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => isSpeaking ? stopSpeaking() : messages.length > 0 && speakText(messages[messages.length - 1].content)}
          disabled={messages.length === 0}
          className={`p-2.5 rounded-xl transition-colors ${
            isSpeaking 
              ? "bg-red-500/20 text-red-400" 
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50"
          }`}
        >
          {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          disabled={isLoading}
          className="flex-1 bg-zinc-900 text-zinc-200 text-sm px-4 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
        />
        <button
          onClick={() => handleSend(inputText)}
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
        >
          <Send size={18} />
        </button>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Accent Gauge */}
      {currentRepeatPhrase && (
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Frase para practicar:</p>
          <AccentGauge targetText={currentRepeatPhrase} label="" />
        </div>
      )}
    </div>
  );
}