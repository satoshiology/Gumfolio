import * as React from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface VoiceChatProps {
  onTranscript: (transcript: string) => void;
}

// Define SpeechRecognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}
interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

export default function VoiceChat({ onTranscript }: VoiceChatProps) {
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        onTranscript(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Speech Recognition not supported in this browser.");
        return;
    }
    
    if (isListening) {
      // Explicitly abort to immediately stop listening and discard pending results
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      try {
          recognitionRef.current.start();
          setIsListening(true);
      } catch (err) {
          console.error("Recognition already started or error:", err);
          setIsListening(false);
      }
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleListening}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
        isListening 
          ? "bg-red-500 text-white" 
          : "bg-surface-container-high text-on-surface-variant hover:bg-primary/20 hover:text-primary"
      )}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </motion.button>
  );
}
