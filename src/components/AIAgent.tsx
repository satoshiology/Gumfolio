import * as React from "react";
import { Sparkles, Send, Bot, Zap, BrainCircuit, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { gumroadService } from "../services/gumroadService";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { useChatContext } from "../context/ChatContext";
import { playSound } from "../lib/sounds";

export default function AIAgent() {
  const [input, setInput] = React.useState("");
  const [consoleOpen, setConsoleOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { messages, setMessages, clearHistory } = useChatContext();

  const chatRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not defined!");
      return;
    }
    
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
                systemInstruction: `You are Gumfolio's AI Strategist. You help digital creators optimize their Gumroad business. Be concise, professional, and insightful. Responses must be no longer than 2-3 sentences. Use markdown for formatting and always use double newlines (\\n\\n) to separate paragraphs.
                
Here is the current business data:
${context}`,
              },
            });
        } catch (error) {
            console.error("Failed to initialize chat context:", error);
        }
    };
    
    initChat();
  }, []);

  const handleSend = async (textOrEvent?: string | React.MouseEvent) => {
    const text = typeof textOrEvent === 'string' ? textOrEvent : input;
    if (typeof text !== 'string' || !text.trim() || isLoading) return;
    
    if (text.toLowerCase().includes("clear history")) {
      clearHistory();
      setInput("");
      playSound('click');
      return;
    }

    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    playSound('messageSend');
    
    try {
      const response = await chatRef.current.sendMessage({ message: text });
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response.text 
      }]);
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-2xl mx-auto flex flex-col h-full w-full"
    >
      <header className="mb-8 text-center flex justify-between items-center px-4">
        <button onClick={() => { setConsoleOpen(true); playSound('click'); }} className="text-secondary hover:text-primary transition-colors">
          <Zap className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">AI Strategist</h1>
        <div className="w-6" /> {/* Spacer */}
      </header>

      {consoleOpen && (
        <div className="fixed inset-0 z-[60] bg-zinc-950/90 backdrop-blur-md p-6 flex flex-col">
            <button onClick={() => setConsoleOpen(false)} className="self-end mb-4 text-on-surface">Close</button>
            <div className="h-full overflow-y-auto">
                <AgentConsole />
            </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <motion.div 
          key="chat"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto space-y-6 px-2 scrollbar-hide py-4">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-primary/20 text-on-surface border border-primary/30 rounded-tr-none" 
                    : "bg-surface-container-high/60 text-on-surface border border-white/5 rounded-tl-none backdrop-blur-md prose prose-invert prose-sm max-w-none"
                )}>
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
                <span className="text-[10px] font-label text-zinc-600 uppercase tracking-widest mt-2 px-1">
                  {msg.role === "user" ? "You" : "Noir Intelligence"}
                </span>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-primary/60 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-label uppercase tracking-widest">Processing...</span>
              </div>
            )}
          </div>

          <div className="relative shrink-0 p-2">
            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full -z-10 opacity-50"></div>
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your strategist..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-zinc-600 px-4 py-2 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,65,0.4)] disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}

