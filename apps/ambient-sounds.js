// Ambient Sounds Widget (like Noisli)
(function() {
  'use strict';

  const floatingAmbient = document.getElementById('floatingAmbient');
  
  // Sound data
  const sounds = [
    { id: 'rain', name: '🌧️ Rain', icon: '🌧️', color: '#6B7280', type: 'generated' },
    { id: 'thunder', name: '⛈️ Thunder', icon: '⛈️', color: '#4B5563', type: 'generated' },
    { id: 'wind', name: '💨 Wind', icon: '💨', color: '#9CA3AF', type: 'generated' },
    { id: 'forest', name: '🌲 Forest', icon: '🌲', color: '#10B981', type: 'generated' },
    { id: 'ocean', name: '🌊 Ocean', icon: '🌊', color: '#3B82F6', type: 'generated' },
    { id: 'fire', name: '🔥 Fire', icon: '🔥', color: '#EF4444', type: 'generated' },
    { id: 'coffee', name: '☕ Café', icon: '☕', color: '#92400E', type: 'generated' },
    { id: 'whitenoise', name: '📻 White Noise', icon: '📻', color: '#E5E7EB', type: 'generated' }
  ];

  const audioElements = {};
  const activeSounds = new Set();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const soundGenerators = {};

  // Generate ambient sounds using Web Audio API
  function createNoiseBuffer(type = 'white') {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }
    
    return buffer;
  }

  function createSoundGenerator(soundId) {
    let source, gainNode, filter;
    
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5;
    
    switch(soundId) {
      case 'rain':
        source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer('pink');
        source.loop = true;
        filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 0.5;
        source.connect(filter);
        filter.connect(gainNode);
        break;
        
      case 'thunder':
        source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer('brown');
        source.loop = true;
        filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        source.connect(filter);
        filter.connect(gainNode);
        break;
        
      case 'wind':
        source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer('white');
        source.loop = true;
        filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;
        source.connect(filter);
        filter.connect(gainNode);
        break;
        
      case 'ocean':
        source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer('brown');
        source.loop = true;
        filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        source.connect(filter);
        filter.connect(gainNode);
        break;
        
      case 'fire':
        source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer('pink');
        source.loop = true;
        filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.8;
        source.connect(filter);
        filter.connect(gainNode);
        break;
        
      case 'forest':
        source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer('pink');
        source.loop = true;
        filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1.5;
        source.connect(filter);
        filter.connect(gainNode);
        break;
        
      case 'coffee':
        source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer('brown');
        source.loop = true;
        filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        source.connect(filter);
        filter.connect(gainNode);
        break;
        
      case 'whitenoise':
        source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer('white');
        source.loop = true;
        source.connect(gainNode);
        break;
    }
    
    gainNode.connect(audioContext.destination);
    source.start(0);
    
    return { source, gainNode, filter };
  }

  function toggleSound(soundId) {
    console.log('[AMBIENT] Toggle sound:', soundId, 'Currently active:', activeSounds.has(soundId));
    
    // Resume AudioContext if suspended (required for autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    if (activeSounds.has(soundId)) {
      // Stop sound
      if (soundGenerators[soundId]) {
        soundGenerators[soundId].gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        setTimeout(() => {
          if (soundGenerators[soundId]) {
            soundGenerators[soundId].source.stop();
            soundGenerators[soundId] = null;
          }
        }, 500);
      }
      activeSounds.delete(soundId);
      updateUI(soundId, false);
      console.log('[AMBIENT] Stopped:', soundId);
    } else {
      // Start sound
      try {
        soundGenerators[soundId] = createSoundGenerator(soundId);
        activeSounds.add(soundId);
        updateUI(soundId, true);
        console.log('[AMBIENT] Successfully playing:', soundId);
      } catch (err) {
        console.error('[AMBIENT] Play failed for', soundId, ':', err);
        activeSounds.delete(soundId);
        updateUI(soundId, false);
        
        // Show user feedback
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        if (card) {
          const nameEl = card.querySelector('.sound-name');
          const originalText = nameEl.textContent;
          nameEl.textContent = '⚠️ Error';
          setTimeout(() => {
            nameEl.textContent = originalText;
          }, 2000);
        }
      }
    }
  }

  function updateUI(soundId, isActive) {
    const card = document.querySelector(`[data-sound="${soundId}"]`);
    if (card) {
      card.classList.toggle('active', isActive);
    }
  }

  function setVolume(soundId, volume) {
    if (soundGenerators[soundId] && soundGenerators[soundId].gainNode) {
      soundGenerators[soundId].gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
    }
  }

  function stopAll() {
    const soundsToStop = Array.from(activeSounds);
    soundsToStop.forEach(soundId => {
      toggleSound(soundId);
    });
  }

  // Generate sound cards
  function initializeSoundCards() {
    const grid = document.getElementById('ambientSoundsGrid');
    if (!grid) return;

    sounds.forEach(sound => {
      const card = document.createElement('div');
      card.className = 'sound-card';
      card.setAttribute('data-sound', sound.id);
      
      card.innerHTML = `
        <div class="sound-icon">${sound.icon}</div>
        <div class="sound-name">${sound.name}</div>
        <div class="volume-control">
          <input type="range" 
                 class="volume-slider" 
                 min="0" 
                 max="100" 
                 value="50"
                 data-sound="${sound.id}">
        </div>
      `;
      
      // Click to toggle
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('volume-slider')) {
          console.log('[AMBIENT] Card clicked:', sound.id);
          toggleSound(sound.id);
        }
      });
      
      // Volume slider
      const slider = card.querySelector('.volume-slider');
      slider.addEventListener('input', (e) => {
        setVolume(sound.id, e.target.value / 100);
      });
      
      grid.appendChild(card);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSoundCards);
  } else {
    initializeSoundCards();
  }

  // Button handlers
  const stopAllBtn = document.getElementById('stopAllSoundsBtn');
  if (stopAllBtn) {
    stopAllBtn.addEventListener('click', stopAll);
  }

  const randomMixBtn = document.getElementById('randomMixBtn');
  if (randomMixBtn) {
    randomMixBtn.addEventListener('click', () => {
      // Stop all first
      stopAll();
      
      // Randomly select 2-4 sounds
      const numSounds = Math.floor(Math.random() * 3) + 2;
      const shuffled = [...sounds].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numSounds);
      
      selected.forEach(sound => {
        setTimeout(() => {
          toggleSound(sound.id);
          // Random volume between 30-70%
          const randomVolume = (Math.random() * 0.4 + 0.3);
          setVolume(sound.id, randomVolume);
          const slider = document.querySelector(`[data-sound="${sound.id}"] .volume-slider`);
          if (slider) slider.value = randomVolume * 100;
        }, 100);
      });
    });
  }

  // Settings button handler
  const ambientSettingsBtn = document.getElementById('ambientSettingsBtn');
  if (ambientSettingsBtn) {
    ambientSettingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Open main settings page to ambient sounds section
      const settingsBtn = document.getElementById('settingsBtn');
      if (settingsBtn) {
        settingsBtn.click();
        // Wait for settings page to open, then navigate to ambient settings
        setTimeout(() => {
          const ambientSettingsItem = document.querySelector('.settings-app-item[data-app="ambient"]');
          if (ambientSettingsItem) {
            ambientSettingsItem.click();
          }
        }, 100);
      }
    });
  }

  // Export for main script
  window.AmbientSoundsWidget = {
    element: floatingAmbient,
    sounds: sounds,
    toggleSound: toggleSound,
    setVolume: setVolume,
    stopAll: stopAll
  };
})();
