type SoundName = 
  | 'buttonClick'   // General button clicks
  | 'arrowSelect'   // Selecting an arrow
  | 'win'           // Winning a round
  | 'loss'          // Losing a round
  | 'extraLife'     // Getting an extra life
  | 'cashoutSuccess'
  | 'placeBet'; 

class SoundManager {
  private sounds: Map<SoundName, string> = new Map();
  private isMuted: boolean = false;

  constructor() {
    // Store sound paths
    this.sounds.set('buttonClick', '/sounds/button-click.mp3');
    this.sounds.set('arrowSelect', '/sounds/arrow-select.mp3');
    this.sounds.set('win', '/sounds/win.mp3');
    this.sounds.set('loss', '/sounds/loss.mp3');
    this.sounds.set('extraLife', '/sounds/extra-life.mp3');
    this.sounds.set('cashoutSuccess', '/sounds/cashout.mp3');
    this.sounds.set('placeBet', '/sounds/place-bet.wav');
  }

  play(name: SoundName) {
    if (this.isMuted) return;

    const soundPath = this.sounds.get(name);
    if (soundPath) {
      try {
        const audio = new Audio(soundPath);
        audio.volume = 0.5; // Set a reasonable default volume
        audio.play().catch(error => {
          console.warn(`Failed to play sound ${name}:`, error);
        });
      } catch (error) {
        console.warn(`Error playing sound ${name}:`, error);
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  getMute() {
    return this.isMuted;
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

export default soundManager; 