import * as React from "react";
import { X, Delete } from "lucide-react";
import { cn } from "../lib/utils";

export function NumberPad({ onConfirm, onClose }: { onConfirm: () => void, onClose: () => void }) {
  const [input, setInput] = React.useState("");
  const passkey = "987654321";

  const handlePress = (num: string) => {
    const newInput = input + num;
    setInput(newInput);
    if (newInput === passkey) {
      onConfirm();
    } else if (newInput.length >= passkey.length) {
      setInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card w-full max-w-sm rounded-[2rem] p-8 space-y-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-headline font-bold text-on-surface text-center">Enter Passkey</h3>
        <div className="text-center text-2xl font-mono tracking-widest text-primary h-8">
            {input.split("").map(() => "*").join("")}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handlePress(n.toString())} className="p-4 rounded-full bg-surface-container-high text-xl font-bold hover:bg-primary/20 transition-all">
              {n}
            </button>
          ))}
          <div/>
          <button onClick={() => handlePress("0")} className="p-4 rounded-full bg-surface-container-high text-xl font-bold hover:bg-primary/20 transition-all">0</button>
          <button onClick={() => setInput("")} className="p-4 flex items-center justify-center rounded-full bg-surface-container-high text-xl font-bold hover:bg-red-500/20 text-red-400 transition-all">
            <Delete className="w-6 h-6" />
          </button>
        </div>
        <button onClick={onClose} className="w-full p-3 rounded-xl bg-surface-container-high text-on-surface hover:bg-zinc-800 transition-all">Cancel</button>
      </div>
    </div>
  );
}
