import * as React from "react";
import { useStrategyContext } from "../context/StrategyContext";
import { useChatContext } from "../context/ChatContext";
import { Trash2, Sparkles, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export function StrategyEchoChamber() {
  const { pinnedItems, unpinItem } = useStrategyContext();
  const { chatRef, setMessages } = useChatContext();
  const [isSynthesizing, setIsSynthesizing] = React.useState(false);

  const runSynapse = async () => {
    if (!chatRef.current || pinnedItems.length === 0) return;
    setIsSynthesizing(true);
    try {
        const strategyContext = pinnedItems.map(item => item.content).join("\n\n---\n\n");
        const response = await chatRef.current.sendMessage({ 
            message: `Analyze these pinned strategies and offer a consolidated, high-level tactical execution plan. Include:\n1. A detailed execution plan.\n2. Potential risks and mitigation strategies.\n3. Key success metrics to track.\n\nPinned Strategies:\n${strategyContext}` 
        });
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `### 🧠 Strategy Synapse Insights\n\n${response.text}` 
        }]);
    } catch (e) {
        console.error("Synapse error", e);
    } finally {
        setIsSynthesizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 bg-zinc-950/50 backdrop-blur-xl border-l border-white/5">
      <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Strategy Echo
        </span>
        {pinnedItems.length > 0 && (
            <button 
                onClick={runSynapse}
                disabled={isSynthesizing}
                className="text-primary hover:text-white transition-colors"
                title="Synthesize Pinned Strategies"
            >
                <BrainCircuit className={cn("w-6 h-6", isSynthesizing && "animate-pulse")} />
            </button>
        )}
      </h2>
      <div className="flex-1 overflow-y-auto space-y-4">
        <AnimatePresence mode="popLayout">
          {pinnedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container-high/60 p-4 rounded-xl border border-white/5 text-sm leading-relaxed"
            >
              <p className="text-on-surface mb-3">{item.content}</p>
              <button 
                onClick={() => unpinItem(item.id)}
                className="text-zinc-600 hover:text-red-400 transition-colors"
                title="Unpin"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          {pinnedItems.length === 0 && (
            <p className="text-zinc-600 text-center italic mt-10">No strategies pinned yet. Pin insights from the AI chat.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
