class MiniPianoMap {
  constructor(options = {}) {
    this.startMidi = options.startMidi || 33; // A0
    this.endMidi = options.endMidi || 88;     // E5
    this.width = options.width || 300;
    this.height = options.height || 28;
    this.visibleFractionStart = 0.35;
    this.visibleFractionEnd = 0.65;

    // Realistic acoustic piano black key horizontal offsets
    // C# is nudged left (~0.42), D# is nudged right (~0.58)
    // F# is nudged left (~0.38), G# is centered (0.50), A# is nudged right (~0.62)
    this.blackKeyOffsets = {
      1: 0.42, // C#
      3: 0.58, // D#
      6: 0.38, // F#
      8: 0.50, // G#
      10: 0.62 // A#
    };

    this.container = makeElement('div', {
      className: 'mini-piano-map-container',
      style: {
        position: 'absolute',
        display: 'none',
        overflow: 'hidden',
        borderRadius: '8px',
        background: 'rgba(10, 15, 26, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.55), inset 0 0 6px rgba(0, 0, 0, 0.6)',
        boxSizing: 'border-box',
        zIndex: '15',
        pointerEvents: 'none',
        backdropFilter: 'blur(6px)',
        webkitBackdropFilter: 'blur(6px)',
      },
    });

    this.svg = makeElement('svg:svg', {
      style: {
        width: '100%',
        height: '100%',
        display: 'block',
      },
    });
    this.container.appendChild(this.svg);
  }

  getContainer() {
    return this.container;
  }

  setSize(width, height) {
    this.width = Math.max(10, width);
    this.height = Math.max(10, height);
    this.render();
  }

  setViewport(fractionStart, fractionEnd) {
    this.visibleFractionStart = Math.max(0, Math.min(1, fractionStart));
    this.visibleFractionEnd = Math.max(0, Math.min(1, fractionEnd));
    this.updateViewportOverlay();
  }

  show() {
    this.container.style.display = 'block';
  }

  hide() {
    this.container.style.display = 'none';
  }

  destroy() {
    if (this.container && this.container.parentElement) {
      this.container.remove();
    }
  }

  render() {
    this.svg.innerHTML = '';
    const width = this.width;
    const height = this.height;
    if (width <= 0 || height <= 0) return;

    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const whiteKeys = [];
    const blackKeys = [];

    let currentWhiteIndex = 0;
    for (let midi = this.startMidi; midi <= this.endMidi; midi++) {
      const pitchClass = midi % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(pitchClass);
      if (!isBlack) {
        whiteKeys.push({ midi, whiteIndex: currentWhiteIndex });
        currentWhiteIndex++;
      } else {
        blackKeys.push({ midi, pitchClass, prevWhiteIndex: currentWhiteIndex - 1 });
      }
    }

    const totalWhite = whiteKeys.length;
    if (totalWhite === 0) return;

    const keyWidth = width / totalWhite;
    const strokeWidth = Math.max(1, keyWidth - 0.95);
    const blackKeyHeight = height * 0.58;
    const blackStrokeWidth = Math.max(1, strokeWidth * 0.72);

    // 1. White Keys (crisp vertical white lines)
    const whiteGroup = makeElement('svg:g', { className: 'mini-white-keys' });
    whiteKeys.forEach((wk) => {
      const x = wk.whiteIndex * keyWidth + keyWidth / 2;
      const line = makeElement('svg:line', {
        x1: x,
        y1: 1,
        x2: x,
        y2: height - 1,
        stroke: '#f8fafc',
        'stroke-width': strokeWidth,
        'stroke-linecap': 'butt',
      });
      whiteGroup.appendChild(line);
    });
    this.svg.appendChild(whiteGroup);

    // 2. Black Keys (shorter vertical black lines with acoustic spacing)
    const blackGroup = makeElement('svg:g', { className: 'mini-black-keys' });
    blackKeys.forEach((bk) => {
      const offsetFraction = this.blackKeyOffsets[bk.pitchClass] || 0.5;
      const leftWhiteCenter = bk.prevWhiteIndex * keyWidth + keyWidth / 2;
      const rightWhiteCenter = (bk.prevWhiteIndex + 1) * keyWidth + keyWidth / 2;
      const x = leftWhiteCenter + (rightWhiteCenter - leftWhiteCenter) * offsetFraction;

      const line = makeElement('svg:line', {
        x1: x,
        y1: 1,
        x2: x,
        y2: blackKeyHeight,
        stroke: '#090d16',
        'stroke-width': blackStrokeWidth,
        'stroke-linecap': 'butt',
      });
      blackGroup.appendChild(line);
    });
    this.svg.appendChild(blackGroup);

    // 3. Viewport highlight overlay & dimming layers with smooth glide transitions
    this.dimLeft = makeElement('svg:rect', {
      x: 0,
      y: 0,
      width: 0,
      height: height,
      fill: 'rgba(0, 0, 0, 0.65)',
      style: { transition: 'x 0.35s ease, width 0.35s ease' },
    });
    this.svg.appendChild(this.dimLeft);

    this.dimRight = makeElement('svg:rect', {
      x: width,
      y: 0,
      width: 0,
      height: height,
      fill: 'rgba(0, 0, 0, 0.65)',
      style: { transition: 'x 0.35s ease, width 0.35s ease' },
    });
    this.svg.appendChild(this.dimRight);

    this.viewportBox = makeElement('svg:rect', {
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: 'rgba(0, 242, 254, 0.14)',
      stroke: '#00f2fe',
      'stroke-width': 1.6,
      rx: 2,
      style: {
        transition: 'x 0.35s ease, width 0.35s ease',
        filter: 'drop-shadow(0 0 3px rgba(0, 242, 254, 0.6))',
      },
    });
    this.svg.appendChild(this.viewportBox);

    this.updateViewportOverlay();
  }

  updateViewportOverlay() {
    if (!this.viewportBox || !this.dimLeft || !this.dimRight) return;

    const width = this.width;
    const height = this.height;

    const leftPx = Math.max(0, this.visibleFractionStart * width);
    const rightPx = Math.min(width, this.visibleFractionEnd * width);
    const boxW = Math.max(4, rightPx - leftPx);

    this.dimLeft.setAttribute('width', Math.max(0, leftPx));

    this.dimRight.setAttribute('x', rightPx);
    this.dimRight.setAttribute('width', Math.max(0, width - rightPx));

    this.viewportBox.setAttribute('x', leftPx);
    this.viewportBox.setAttribute('width', boxW);
    this.viewportBox.setAttribute('height', height);
  }
}

globalThis.MiniPianoMap = MiniPianoMap;
if (typeof module !== 'undefined' && module.exports) module.exports = MiniPianoMap;