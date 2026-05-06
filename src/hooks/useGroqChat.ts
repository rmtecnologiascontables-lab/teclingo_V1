import { useState, useCallback, useRef } from "react";

export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  repeatPhrase?: string;
}

interface GroqChatOptions {
  level: EnglishLevel;
  onSpeak?: (text: string) => void;
}

const systemPrompts: Record<EnglishLevel, string> = {
  A1: `You are a friendly English tutor for a beginner A1 level student. 
- Use very simple words and short sentences (2-5 words per sentence)
- Use present simple, basic greetings, and common phrases
- Be patient and encouraging
- At the end of EVERY response, include a short phrase (3-5 words) for the student to practice pronunciation
- Format the phrase like this: [REPEAT: phrase to practice]
- Example: [REPEAT: Good morning teacher]`,
  
  A2: `You are an English tutor for an elementary A2 level student.
- Use simple but slightly more varied vocabulary
- Use basic sentence structures and common expressions
- Can describe simple past events
- At the end of EVERY response, include a short phrase (4-8 words) for pronunciation practice
- Format: [REPEAT: phrase to practice]`,
  
  B1: `You are an English tutor for an intermediate B1 level student.
- Use more complex sentences and varied vocabulary
- Can discuss topics like travel, work, hobbies
- Use some idiomatic expressions appropriately
- At the end of EVERY response, include a phrase (6-12 words) for pronunciation practice
- Format: [REPEAT: phrase to practice]`,
  
  B2: `You are an English tutor for an upper-intermediate B2 level student.
- Use advanced vocabulary and complex sentence structures
- Can discuss abstract topics, opinions, and current events
- Use sophisticated idioms and phrases
- At the end of EVERY response, include a challenging phrase (8-15 words) for pronunciation practice
- Format: [REPEAT: phrase to practice]`,
  
  C1: `You are an English tutor for an advanced C1 level student.
- Use academic and professional vocabulary
- Discuss complex topics with nuance
- Use sophisticated expressions and rare idioms
- At the end of EVERY response, include a complex phrase (10-20 words) for pronunciation practice
- Format: [REPEAT: phrase to practice]`,
  
  C2: `You are an English tutor for a fluent C2 master level student.
- Use expert-level vocabulary and nuanced expressions
- Discuss any topic with precision and elegance
- Use literary and sophisticated language
- At the end of EVERY response, include an eloquent phrase (12-25 words) for pronunciation practice
- Format: [REPEAT: phrase to practice]`,
};

export const useGroqChat = ({ level, onSpeak }: GroqChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentRepeatPhrase, setCurrentRepeatPhrase] = useState("");
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const speakText = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    onSpeak?.(text);
  }, [onSpeak]);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const extractRepeatPhrase = (content: string): { cleanedContent: string; phrase: string } => {
    const regex = /\[REPEAT:\s*([^\]]+)\]/i;
    const match = content.match(regex);
    
    if (match) {
      const phrase = match[1].trim();
      const cleanedContent = content.replace(regex, "").trim();
      return { cleanedContent, phrase };
    }
    
    return { cleanedContent: content, phrase: "" };
  };

  const sendMessage = useCallback(async (userInput: string) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      setError("Groq API key not configured");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompts[level] },
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: "user", content: userInput }
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get response");
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content || "Sorry, I didn't get a response.";
      
      const { cleanedContent, phrase } = extractRepeatPhrase(assistantContent);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: cleanedContent,
        repeatPhrase: phrase,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (phrase) {
        setCurrentRepeatPhrase(phrase);
      }

      setTimeout(() => {
        speakText(cleanedContent);
      }, 500);

    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }, [level, messages, speakText]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentRepeatPhrase("");
    setError(null);
    stopSpeaking();
  }, [stopSpeaking]);

  const setLevel = useCallback((newLevel: EnglishLevel) => {
    clearChat();
  }, [clearChat]);

  return {
    messages,
    isLoading,
    error,
    isSpeaking,
    currentRepeatPhrase,
    sendMessage,
    clearChat,
    setLevel,
    speakText,
    stopSpeaking,
  };
};