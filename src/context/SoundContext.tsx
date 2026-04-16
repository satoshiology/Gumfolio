import * as React from "react";
import * as Tone from "tone";

type SoundContextType = {
  playClick: () => void;
  playSend: () => void;
  playReceive: () => void;
  init: () => Promise<void>;
};

const SoundContext = React.createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = React.useState(false);

  // We lazily instantiate the synths so they are only created after user interaction
  const synths = React.useRef<{
    click?: Tone.Synth;
    send?: Tone.Synth;
    receive?: Tone.Synth;
  }>({});

  const init = async () => {
    if (isReady) return;

    await Tone.start();

    synths.current.click = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    synths.current.click.volume.value = -15;

    synths.current.send = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
    }).toDestination();
    synths.current.send.volume.value = -15;

    synths.current.receive = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.3 }
    }).toDestination();
    synths.current.receive.volume.value = -15;

    setIsReady(true);
  };

  const playClick = () => {
    if (!isReady || !synths.current.click) return;
    synths.current.click.triggerAttackRelease("C6", "32n");
  };

  const playSend = () => {
    if (!isReady || !synths.current.send) return;
    const now = Tone.now();
    synths.current.send.triggerAttackRelease("E5", "16n", now);
    synths.current.send.triggerAttackRelease("G5", "16n", now + 0.1);
  };

  const playReceive = () => {
    if (!isReady || !synths.current.receive) return;
    const now = Tone.now();
    synths.current.receive.triggerAttackRelease("G5", "16n", now);
    synths.current.receive.triggerAttackRelease("E5", "16n", now + 0.1);
  };

  return (
    <SoundContext.Provider value={{ playClick, playSend, playReceive, init }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = React.useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSoundContext must be used within a SoundProvider");
  }
  return context;
}
