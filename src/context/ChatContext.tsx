import * as React from "react";

interface Message {
  role: string;
  content: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearHistory: () => void;
  chatRef: React.MutableRefObject<any>;
}

export const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Message[]>(() => {
    const saved = localStorage.getItem("chat_history");
    return saved ? JSON.parse(saved) : [{ role: "assistant", content: "Greetings, Creator. I am your Luminous Intelligence. How can I assist with your digital empire today?" }];
  });
  const chatRef = React.useRef<any>(null);

  React.useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    setMessages([{ role: "assistant", content: "Chat history cleared. How can I assist you now?" }]);
    localStorage.removeItem("chat_history");
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, clearHistory, chatRef }}>
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
