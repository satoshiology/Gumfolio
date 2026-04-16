import * as React from "react";

interface Message {
  role: string;
  content: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearHistory: () => void;
}

export const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "assistant", content: "Greetings, Creator. I am your Luminous Intelligence. How can I assist with your digital empire today?" }
  ]);

  const clearHistory = () => {
    setMessages([{ role: "assistant", content: "Chat history cleared. How can I assist you now?" }]);
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, clearHistory }}>
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
