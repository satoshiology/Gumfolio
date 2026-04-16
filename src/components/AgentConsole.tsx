import * as React from "react";
import { Bot, Plus, Trash2, Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import axios from "axios";

export default function AgentConsole() {
  const [agents, setAgents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const spawnAgent = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/agent/run", {
        instructions: "You are a specialized Gumroad store manager agent."
      });
      setAgents(prev => [...prev, { name: `Agent-${prev.length + 1}`, result: response.data.result }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-24"
    >
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-headline font-extrabold tracking-tight">Agent Console</h1>
        <button 
          onClick={spawnAgent}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Spawn Agent
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent, i) => (
          <div key={i} className="bg-surface-container/40 p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-headline font-bold text-lg">{agent.name}</h3>
              </div>
              <button 
                onClick={() => setAgents(prev => prev.filter((_, idx) => idx !== i))}
                className="text-on-surface-variant hover:text-red-400 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-on-surface-variant">Model: {agent.model}</p>
            <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-label uppercase tracking-widest text-zinc-500 mb-2">Available Actions</p>
                <div className="flex gap-2">
                    <Zap className="w-6 h-6 text-secondary"/>
                    <span className="text-sm font-body">Gemini Flash Active</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
