class NotificationSound {
  constructor() {
    // Map notification types to different sounds (if you have multiple tones)
    this.sounds = {
      default: new Audio('/tones/tone1.wav'),
      due_24h: new Audio('/tones/tone1.wav'),
      due_5h: new Audio('/tones/tone1.wav'),
      due_5m: new Audio('/tones/tone1.wav'),
      due_now: new Audio('/tones/tone1.wav'),
      overdue: new Audio('/tones/tone1.wav'),
      reminder: new Audio('/tones/tone1.wav')
    };
    
    this.enabled = true;
    this.volume = 0.5; // Default volume (0 to 1)
    
    // Preload sounds
    this.preloadSounds();
  }
  
  preloadSounds() {
    Object.values(this.sounds).forEach(sound => {
      sound.preload = 'auto';
      sound.volume = this.volume;
    });
  }
  
  play(type = 'default') {
    if (!this.enabled) return;
    
    const sound = this.sounds[type] || this.sounds.default;
    
    try {
      // Reset sound to start
      sound.currentTime = 0;
      
      // Play the sound
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Audio play failed:', error);
          // Auto-play was prevented, user needs to interact first
        });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
  }
  
  isEnabled() {
    return this.enabled;
  }
}

// Export a singleton instance
const notificationSound = new NotificationSound();
export default notificationSound;