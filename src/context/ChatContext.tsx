import * as React from "react";
import { GoogleGenAI } from "@google/genai";
import { gumroadService } from "../services/gumroadService";

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearHistory: () => void;
  chatRef: React.MutableRefObject<any>;
  sendMessage: (text: string) => Promise<string | void>;
  isLoading: boolean;
}

export const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Message[]>(() => {
    const saved = localStorage.getItem("chat_history");
    return saved ? JSON.parse(saved) : [{ role: "assistant", content: "Greetings, Creator. I am your Luminous Intelligence. How can I assist with your digital empire today?" }];
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const chatRef = React.useRef<any>(null);

  React.useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  React.useEffect(() => {
    if (!process.env.GEMINI_API_KEY) return;
    const initChat = async () => {
        try {
            const [products, sales] = await Promise.all([
                gumroadService.getProducts().catch(() => ({ products: [] })),
                gumroadService.getSales().catch(() => ({ sales: [] }))
            ]);
            
            const context = `
Products: ${JSON.stringify(products.products)}
Sales: ${JSON.stringify(sales.sales)}
`;

            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            chatRef.current = ai.chats.create({
              model: "gemini-3.1-flash-lite-preview",
              config: {
                systemInstruction: `You are Gumfolio's AI Strategist. 

YOUR CONSTRAINTS (STRICT):
1. PRIVACY: You are ONLY aware of the business data provided in this prompt. You do NOT possess external knowledge. If a product, person, or company is not in the provided data, you do not know about them. If asked about external people or entities, state "I do not have access to that information."
2. NO HALLUCINATION: Strictly avoid referencing fictional projects or external entities.
3. DATA SOURCE: Rely EXCLUSIVELY on the provided JSON data. 
4. CONCISENESS: Limit all responses to 2-3 short sentences. Extremely brief and direct.

Here is the current business data:
${context}`,
              },
            });
        } catch (error) {
            console.error("Failed to initialize chat context:", error);
        }
    };
    if (!chatRef.current) {
      initChat();
    }
  }, []);

  const clearHistory = () => {
    const currentHistory = JSON.parse(localStorage.getItem("chat_history") || "[]");
    const archivedLogs = JSON.parse(localStorage.getItem("chat_logs_archive") || "[]");
    archivedLogs.push({ clearedAt: new Date().toISOString(), messages: currentHistory });
    localStorage.setItem("chat_logs_archive", JSON.stringify(archivedLogs));

    setMessages([{ role: "assistant", content: "Chat history cleared. How can I assist you now?" }]);
    localStorage.removeItem("chat_history");
  };

  const [chatCount, setChatCount] = React.useState<number>(() => {
    const savedCount = localStorage.getItem("chat_count");
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  React.useEffect(() => {
    localStorage.setItem("chat_count", chatCount.toString());
  }, [chatCount]);

  const checkProStatus = async () => {
    try {
        const user = await gumroadService.getUser();
        const subscribers = await gumroadService.getSubscribers('lTlApI5Eg1p01aTMXcRMqg==');
        return subscribers.subscribers.some(sub => sub.user_email === user.user.email);
    } catch {
        return false;
    }
  };
    
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    if (text.toLowerCase().includes("clear history")) {
      clearHistory();
      setChatCount(0);
      return;
    }

    if (chatCount >= 5) {
        const isPro = await checkProStatus();
        if (!isPro) {
            const blockedMessage = "You have reached your limit of 5 free chats. Please upgrade to PRO to continue.";
            setMessages(prev => [...prev, { role: "assistant", content: blockedMessage }]);
            return blockedMessage;
        }
    }

    setChatCount(prev => prev + 1);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: "user", content: text, timestamp };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      if (!chatRef.current) throw new Error("Chat not initialized");
      const response = await chatRef.current.sendMessage({ message: text });
      const responseText = response.text;
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return responseText;
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I encountered a neural glitch. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, clearHistory, chatRef, sendMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}