import { Howl } from 'howler';

const sounds = {
  click: new Howl({ src: ['/sounds/click.mp3'] }),
  panelOpen: new Howl({ src: ['/sounds/panel-open.mp3'] }),
  messageSend: new Howl({ src: ['/sounds/message-send.mp3'] }),
};

export const playSound = (soundName: keyof typeof sounds) => {
  const isEnabled = localStorage.getItem('soundEnabled') !== 'false';
  if (isEnabled && sounds[soundName]) {
    sounds[soundName].play();
  }
};
