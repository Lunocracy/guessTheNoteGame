class InstrumentSelector {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.instruments = [
      'Wurlitzer EP',
      'Electric Guitar',
      'Marimba',
      'Piano',
      'Music Box',
      'Vibes',
      'Harp',
      'Steel Drum',
      'Random',
    ];
    this.currentInstrument = 'Piano';
    this.spriteSize = 300;

    this.spriteUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <linearGradient id="cellBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c2333"/>
      <stop offset="100%" stop-color="#0b0f19"/>
    </linearGradient>
    <linearGradient id="guitarSunburst" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff9800"/>
      <stop offset="45%" stop-color="#e65100"/>
      <stop offset="100%" stop-color="#210500"/>
    </linearGradient>
  </defs>

  <style>
    .cell { fill: url(#cellBg); stroke: #2a364f; stroke-width: 4; rx: 20; }
    .label { font-family: 'Architects Daughter', Arial, sans-serif; font-size: 26px; font-weight: bold; fill: #ffffff; text-anchor: middle; }
  </style>

  <!-- [0] Wurlitzer EP -->
  <g transform="translate(10, 10)">
    <rect width="280" height="280" class="cell"/>
    <rect x="40" y="70" width="200" height="90" rx="8" fill="#a83232" stroke="#ff6b6b" stroke-width="3"/>
    <rect x="50" y="100" width="180" height="50" fill="#ffffff"/>
    <rect x="65" y="100" width="15" height="30" fill="#111111"/>
    <rect x="95" y="100" width="15" height="30" fill="#111111"/>
    <rect x="140" y="100" width="15" height="30" fill="#111111"/>
    <rect x="170" y="100" width="15" height="30" fill="#111111"/>
    <rect x="200" y="100" width="15" height="30" fill="#111111"/>
    <text x="140" y="240" class="label">Wurlitzer EP</text>
  </g>

  <!-- [1] Electric Guitar -->
  <g transform="translate(310, 10)">
    <rect width="280" height="280" class="cell"/>
    <g transform="translate(140, 105) rotate(-35)">
      <rect x="-6" y="-95" width="12" height="100" fill="#d7ccc8" stroke="#8d6e63" stroke-width="1.5"/>
      <line x1="-6" y1="-80" x2="6" y2="-80" stroke="#8d6e63" stroke-width="1"/>
      <line x1="-6" y1="-65" x2="6" y2="-65" stroke="#8d6e63" stroke-width="1"/>
      <line x1="-6" y1="-50" x2="6" y2="-50" stroke="#8d6e63" stroke-width="1"/>
      <line x1="-6" y1="-35" x2="6" y2="-35" stroke="#8d6e63" stroke-width="1"/>
      <line x1="-6" y1="-20" x2="6" y2="-20" stroke="#8d6e63" stroke-width="1"/>
      <line x1="-6" y1="-5" x2="6" y2="-5" stroke="#8d6e63" stroke-width="1"/>
      <path d="M-6,-95 L-4,-118 C-2,-124 10,-124 12,-114 L6,-95 Z" fill="#bcaaa4" stroke="#8d6e63" stroke-width="1.5"/>
      <circle cx="10" cy="-118" r="2.5" fill="#ffffff"/>
      <circle cx="9" cy="-110" r="2.5" fill="#ffffff"/>
      <circle cx="8" cy="-102" r="2.5" fill="#ffffff"/>
      <path d="M-12,-10 C-28,-30 -38,-15 -28,8 C-40,20 -42,48 -24,62 C-12,70 12,70 24,62 C42,48 40,20 28,8 C38,-15 28,-30 12,-10 Z" fill="url(#guitarSunburst)" stroke="#ffb74d" stroke-width="2.5"/>
      <path d="M-4,0 C-18,-12 -22,2 -16,16 C-24,28 -22,46 -8,52 C0,54 8,48 10,40 C12,25 6,8 -4,0 Z" fill="#ffffff" opacity="0.9"/>
      <rect x="-8" y="10" width="16" height="5" rx="2" fill="#111111" stroke="#cccccc" stroke-width="0.8"/>
      <rect x="-8" y="20" width="16" height="5" rx="2" fill="#111111" stroke="#cccccc" stroke-width="0.8"/>
      <rect x="-8" y="30" width="16" height="5" rx="2" fill="#111111" stroke="#cccccc" stroke-width="0.8"/>
      <rect x="-7" y="42" width="14" height="7" rx="1.5" fill="#b0bec5"/>
      <circle cx="14" cy="38" r="3" fill="#ffd54f"/>
      <circle cx="16" cy="47" r="3" fill="#ffd54f"/>
      <line x1="-3" y1="-115" x2="-3" y2="44" stroke="#ffffff" stroke-width="0.8" opacity="0.8"/>
      <line x1="0" y1="-115" x2="0" y2="44" stroke="#ffffff" stroke-width="0.8" opacity="0.8"/>
      <line x1="3" y1="-115" x2="3" y2="44" stroke="#ffffff" stroke-width="0.8" opacity="0.8"/>
    </g>
    <text x="140" y="240" class="label">Electric Guitar</text>
  </g>

  <!-- [2] Marimba -->
  <g transform="translate(610, 10)">
    <rect width="280" height="280" class="cell"/>
    <g transform="translate(45, 50)">
      <rect x="0" y="0" width="22" height="110" rx="3" fill="#8d5b4c" stroke="#d7ccc8" stroke-width="2"/>
      <rect x="26" y="10" width="22" height="100" rx="3" fill="#8d5b4c" stroke="#d7ccc8" stroke-width="2"/>
      <rect x="52" y="20" width="22" height="90" rx="3" fill="#8d5b4c" stroke="#d7ccc8" stroke-width="2"/>
      <rect x="78" y="30" width="22" height="80" rx="3" fill="#8d5b4c" stroke="#d7ccc8" stroke-width="2"/>
      <rect x="104" y="40" width="22" height="70" rx="3" fill="#8d5b4c" stroke="#d7ccc8" stroke-width="2"/>
      <rect x="130" y="50" width="22" height="60" rx="3" fill="#8d5b4c" stroke="#d7ccc8" stroke-width="2"/>
      <rect x="156" y="60" width="22" height="50" rx="3" fill="#8d5b4c" stroke="#d7ccc8" stroke-width="2"/>
      <circle cx="50" cy="40" r="12" fill="#ff5252"/>
      <line x1="50" y1="40" x2="160" y2="130" stroke="#ffeb3b" stroke-width="4"/>
    </g>
    <text x="140" y="240" class="label">Marimba</text>
  </g>

  <!-- [3] Piano -->
  <g transform="translate(10, 310)">
    <rect width="280" height="280" class="cell"/>
    <g transform="translate(40, 50)">
      <rect x="0" y="0" width="200" height="110" rx="10" fill="#000000" stroke="#00f2fe" stroke-width="3"/>
      <rect x="10" y="30" width="180" height="70" fill="#ffffff" rx="4"/>
      <line x1="36" y1="30" x2="36" y2="100" stroke="#333" stroke-width="2"/>
      <line x1="62" y1="30" x2="62" y2="100" stroke="#333" stroke-width="2"/>
      <line x1="88" y1="30" x2="88" y2="100" stroke="#333" stroke-width="2"/>
      <line x1="114" y1="30" x2="114" y2="100" stroke="#333" stroke-width="2"/>
      <line x1="140" y1="30" x2="140" y2="100" stroke="#333" stroke-width="2"/>
      <line x1="166" y1="30" x2="166" y2="100" stroke="#333" stroke-width="2"/>
      <rect x="26" y="30" width="18" height="42" fill="#111111"/>
      <rect x="52" y="30" width="18" height="42" fill="#111111"/>
      <rect x="104" y="30" width="18" height="42" fill="#111111"/>
      <rect x="130" y="30" width="18" height="42" fill="#111111"/>
      <rect x="156" y="30" width="18" height="42" fill="#111111"/>
    </g>
    <text x="140" y="240" class="label">Piano</text>
  </g>

  <!-- [4] Music Box -->
  <g transform="translate(310, 310)">
    <rect width="280" height="280" class="cell"/>
    <g transform="translate(50, 50)">
      <rect x="20" y="30" width="140" height="90" rx="8" fill="#5d4037" stroke="#bcaaa4" stroke-width="3"/>
      <circle cx="90" cy="75" r="25" fill="#ffd54f" stroke="#ffb300" stroke-width="3"/>
      <circle cx="160" cy="50" r="10" fill="#ffd54f"/>
      <path d="M160,50 Q180,40 180,65" stroke="#ffd54f" stroke-width="5" fill="none"/>
    </g>
    <text x="140" y="240" class="label">Music Box</text>
  </g>

  <!-- [5] Vibes -->
  <g transform="translate(610, 310)">
    <rect width="280" height="280" class="cell"/>
    <g transform="translate(45, 50)">
      <rect x="0" y="20" width="190" height="25" rx="4" fill="#cfd8dc" stroke="#90a4ae" stroke-width="2"/>
      <rect x="15" y="45" width="20" height="70" fill="#78909c" rx="3"/>
      <rect x="45" y="45" width="20" height="65" fill="#78909c" rx="3"/>
      <rect x="75" y="45" width="20" height="60" fill="#78909c" rx="3"/>
      <rect x="105" y="45" width="20" height="55" fill="#78909c" rx="3"/>
      <rect x="135" y="45" width="20" height="50" fill="#78909c" rx="3"/>
      <rect x="165" y="45" width="20" height="45" fill="#78909c" rx="3"/>
      <circle cx="130" cy="20" r="12" fill="#29b6f6"/>
    </g>
    <text x="140" y="240" class="label">Vibes</text>
  </g>

  <!-- [6] Harp -->
  <g transform="translate(10, 610)">
    <rect width="280" height="280" class="cell"/>
    <g transform="translate(60, 40)">
      <path d="M30,130 L30,20 C80,20 120,50 140,110 C140,130 110,130 30,130 Z" fill="none" stroke="#ffb300" stroke-width="6"/>
      <line x1="45" y1="125" x2="45" y2="30" stroke="#ffe082" stroke-width="2"/>
      <line x1="60" y1="125" x2="60" y2="40" stroke="#ffe082" stroke-width="2"/>
      <line x1="75" y1="125" x2="75" y2="52" stroke="#ffe082" stroke-width="2"/>
      <line x1="90" y1="125" x2="90" y2="68" stroke="#ffe082" stroke-width="2"/>
      <line x1="105" y1="125" x2="105" y2="86" stroke="#ffe082" stroke-width="2"/>
      <line x1="120" y1="125" x2="120" y2="105" stroke="#ffe082" stroke-width="2"/>
    </g>
    <text x="140" y="240" class="label">Harp</text>
  </g>

  <!-- [7] Steel Drum -->
  <g transform="translate(310, 610)">
    <rect width="280" height="280" class="cell"/>
    <g transform="translate(50, 45)">
      <ellipse cx="90" cy="75" rx="75" ry="50" fill="#37474f" stroke="#78909c" stroke-width="4"/>
      <ellipse cx="60" cy="65" rx="18" ry="12" fill="#546e7a" stroke="#90a4ae" stroke-width="2"/>
      <ellipse cx="120" cy="65" rx="18" ry="12" fill="#546e7a" stroke="#90a4ae" stroke-width="2"/>
      <ellipse cx="90" cy="95" rx="20" ry="12" fill="#546e7a" stroke="#90a4ae" stroke-width="2"/>
      <circle cx="90" cy="60" r="8" fill="#ff7043"/>
    </g>
    <text x="140" y="240" class="label">Steel Drum</text>
  </g>

  <!-- [8] Random -->
  <g transform="translate(610, 610)">
    <rect width="280" height="280" class="cell"/>
    <g transform="translate(60, 45)">
      <rect x="25" y="25" width="110" height="110" rx="18" fill="#7b1fa2" stroke="#e1bee7" stroke-width="4"/>
      <circle cx="50" cy="50" r="10" fill="#ffffff"/>
      <circle cx="110" cy="50" r="10" fill="#ffffff"/>
      <circle cx="80" cy="80" r="10" fill="#ffffff"/>
      <circle cx="50" cy="110" r="10" fill="#ffffff"/>
      <circle cx="110" cy="110" r="10" fill="#ffffff"/>
    </g>
    <text x="140" y="240" class="label">Random</text>
  </g>
</svg>`);
  }

  start() {
    this.currentDisplay = makeElement('div', {
      id: 'instrumentSelectorButton',
      className: 'instrument-select-btn',
      title: 'Select Instrument',
      style: {
        position: 'absolute',
        background: 'rgba(15, 23, 42, 0.85)',
        zIndex: '10',
        cursor: 'pointer',
        borderRadius: '12px',
        border: '1.5px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        backgroundImage: `url("${this.spriteUrl}")`,
        backgroundSize: '300% 300%',
        backgroundPosition: '0% 50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: 'transform 0.2s, opacity 0.2s ease, border-color 0.2s',
      },
    });

    this.labelPill = makeElement('div', {
      className: 'instrument-label-pill',
      textContent: 'Piano',
      style: {
        width: '100%',
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#00f2fe',
        fontFamily: '"Architects Daughter", Arial, sans-serif',
        fontSize: '11px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '2px 0',
        textShadow: '0 0 4px rgba(0, 242, 254, 0.6)',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }
    });
    this.currentDisplay.appendChild(this.labelPill);
    this.game.rootElement.appendChild(this.currentDisplay);

    this.positioner = new SmartElementPositioner(this.currentDisplay, {
      container: this.game.rootElement,
      position: [75, 79],
      size: [17, 17],
      aspectRatio: 1,
      sizeCallback: (self, pixelDims) => {
        const fontSize = Math.max(9, Math.min(13, pixelDims.height * 0.18));
        this.labelPill.style.fontSize = `${fontSize}px`;
      },
    });

    this.currentDisplay.addEventListener('click', () => this.showPopup());

    this.overlay = makeElement('div', {
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: '99',
        opacity: '0',
        transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
        backdropFilter: 'blur(4px)',
      },
    });
    this.overlay.addEventListener('click', () => this.hidePopup());
    this.game.rootElement.appendChild(this.overlay);

    this.popup = makeElement('div', {
      className: 'instrument-popup',
      style: {
        position: 'absolute',
        display: 'none',
        backgroundImage: `url("${this.spriteUrl}")`,
        backgroundSize: '100% 100%',
        backgroundColor: '#0b0f19',
        border: '3px solid #00f2fe',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 242, 254, 0.3)',
        zIndex: '100',
        transform: 'translateY(100%)',
        opacity: '0',
        transition: 'transform 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 0.35s ease-out',
        cursor: 'pointer',
      },
    });
    this.game.rootElement.appendChild(this.popup);

    this.popupPositioner = new SmartElementPositioner(this.popup, {
      container: this.game.rootElement,
      position: [7.5, 12],
      size: [85, 75],
      aspectRatio: 1,
      sizeCallback: (self, pixelDims) => {
        self.element.style.width = `${pixelDims.width}px`;
        self.element.style.height = `${pixelDims.height}px`;
        self.element.style.backgroundSize = `${pixelDims.width}px ${pixelDims.height}px`;
      },
    });

    this.popup.addEventListener('click', (e) => this.handleSelection(e));

    const initialIndex = this.instruments.indexOf(this.currentInstrument);
    if (initialIndex !== -1) {
      this.setInstrument(this.currentInstrument);
      this.updateDisplay(initialIndex);
    } else {
      this.currentInstrument = this.instruments[3];
      this.setInstrument(this.currentInstrument);
      this.updateDisplay(3);
    }

    this.positioner.update();
    this.popupPositioner.update();
  }

  showPopup() {
    this.overlay.style.opacity = '1';
    this.overlay.style.pointerEvents = 'auto';
    this.popup.style.display = 'block';
    this.popupPositioner.update();
    requestAnimationFrame(() => {
      this.popup.style.transform = 'translateY(0)';
      this.popup.style.opacity = '1';
    });
  }

  hidePopup() {
    this.popup.style.transform = 'translateY(15%) scale(0.95)';
    this.popup.style.opacity = '0';
    this.overlay.style.opacity = '0';
    this.overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      this.popup.style.display = 'none';
      this.popup.style.transform = 'translateY(100%)';
    }, 350);
  }

  handleSelection(event) {
    const rect = this.popup.getBoundingClientRect();
    const rootRect = this.game.rootElement.getBoundingClientRect();
    const scale = rect.width / 900;
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    const col = Math.floor(x / this.spriteSize);
    const row = Math.floor(y / this.spriteSize);
    const index = Math.max(0, Math.min(8, row * 3 + col));

    if (index >= 0 && index < this.instruments.length) {
      const selectedInstrument = this.instruments[index];

      const highlight = makeElement('div', {
        style: {
          position: 'absolute',
          left: `${col * 33.33}%`,
          top: `${row * 33.33}%`,
          width: '33.33%',
          height: '33.33%',
          background: 'rgba(0, 242, 254, 0.35)',
          border: '3px solid #00f2fe',
          borderRadius: '12px',
          zIndex: '101',
          boxShadow: '0 0 20px rgba(0, 242, 254, 0.7)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        },
      });
      this.popup.appendChild(highlight);

      this.setInstrument(selectedInstrument)
        .then(() => {
          const popupPixelDims = this.popupPositioner.getPixelDimensions();
          const buttonPixelDims = this.positioner.getPixelDimensions();

          const flyStartX = (rect.left - rootRect.left) + (col * popupPixelDims.width) / 3;
          const flyStartY = (rect.top - rootRect.top) + (row * popupPixelDims.height) / 3;

          const flyback = makeElement('div', {
            style: {
              position: 'absolute',
              left: `${flyStartX}px`,
              top: `${flyStartY}px`,
              width: `${popupPixelDims.width / 3}px`,
              height: `${popupPixelDims.height / 3}px`,
              backgroundImage: `url("${this.spriteUrl}")`,
              backgroundSize: '300% 300%',
              backgroundPosition: `${-(index % 3) * 100}% ${-Math.floor(index / 3) * 100}%`,
              zIndex: '102',
              borderRadius: '12px',
              border: '2px solid #00f2fe',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.8)',
              transition: 'all 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
            },
          });
          this.game.rootElement.appendChild(flyback);

          const buttonRect = this.currentDisplay.getBoundingClientRect();
          const flyEndX = (buttonRect.left - rootRect.left) + buttonRect.width / 2 - buttonPixelDims.width / 2;
          const flyEndY = (buttonRect.top - rootRect.top) + buttonRect.height / 2 - buttonPixelDims.height / 2;

          requestAnimationFrame(() => {
            flyback.style.width = `${buttonPixelDims.width}px`;
            flyback.style.height = `${buttonPixelDims.height}px`;
            flyback.style.transform = `translate(${flyEndX - flyStartX}px, ${flyEndY - flyStartY}px)`;
          });

          setTimeout(() => {
            this.updateDisplay(index);
            this.hidePopup();
            flyback.remove();
            highlight.remove();
          }, 450);
        })
        .catch(() => {
          highlight.remove();
          this.hidePopup();
        });
    }
  }

  setInstrument(name) {
    this.currentInstrument = name;
    if (name === 'Random') {
      if (window.instruments) {
        window.instruments.isRandomInstrument = true;
        const available = [
          'Wurlitzer EP',
          'Electric Guitar',
          'Marimba',
          'Piano',
          'Music Box',
          'Vibes',
          'Harp',
          'Steel Drum'
        ];
        const initial = available[Math.floor(Math.random() * available.length)];
        window.instruments.lastRandomInstrument = initial;
        return window.instruments.setActiveInstrument(initial);
      }
      return Promise.resolve();
    } else {
      if (window.instruments) {
        window.instruments.isRandomInstrument = false;
      }
      return window.instruments ? window.instruments.setActiveInstrument(name) : Promise.resolve();
    }
  }

  updateDisplay(index) {
    const x = -(index % 3) * 100;
    const y = -Math.floor(index / 3) * 100;
    this.currentDisplay.style.opacity = '0';
    this.labelPill.textContent = this.instruments[index];

    setTimeout(() => {
      this.currentDisplay.style.backgroundPosition = `${x}% ${y}%`;
      requestAnimationFrame(() => {
        this.currentDisplay.style.opacity = '1';
      });
    }, 150);
  }
}

globalThis.InstrumentSelector = InstrumentSelector;
if (typeof module !== 'undefined' && module.exports) module.exports = InstrumentSelector;