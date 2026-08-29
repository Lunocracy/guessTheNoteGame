class StaffView {
  constructor() {
    this.diatonicStepMap = {
      'C2': -14, 'D2': -13, 'E2': -12, 'F2': -11, 'G2': -10, 'A2': -9, 'B2': -8,
      'C3': -7,  'D3': -6,  'E3': -5,  'F3': -4,  'G3': -3,  'A3': -2, 'B3': -1,
      'C4': 0,   'D4': 1,   'E4': 2,   'F4': 3,   'G4': 4,   'A4': 5,  'B4': 6,
      'C5': 7,   'D5': 8,   'E5': 9,   'F5': 10,  'G5': 11,  'A5': 12, 'B5': 13,
      'C6': 14,  'D6': 15,  'E6': 16
    };

    this.pitchColors = [
      [240, 25, 25],    // C (Red)
      [250, 125, 0],    // D (Orange)
      [245, 205, 0],    // E (Yellow)
      [0, 195, 40],     // F (Green)
      [0, 115, 245],    // G (Electric Blue)
      [140, 0, 245],    // A (Purple)
      [235, 0, 200],    // B (Magenta)
    ];

    this.showRainbow = true;

    // Device-independent standard SVG vector paths
    this.paths = {
      trebleClef: 'M25.3,64.2 C24.1,65.8 22.2,67.1 19.8,67.7 C17.3,68.4 14.7,68.2 12.3,67.1 C9.9,66.0 7.9,64.1 6.6,61.7 C5.3,59.3 4.8,56.5 5.2,53.7 C5.8,50.1 7.7,46.9 10.5,44.7 C13.3,42.5 16.9,41.4 20.5,41.6 L20.5,41.6 C20.5,37.2 20.3,31.4 19.8,25.2 C19.1,17.1 17.6,10.6 15.3,6.8 C14.3,5.1 13.1,4.1 11.8,3.9 C10.7,3.7 9.8,4.1 9.0,5.1 C7.9,6.5 7.4,8.9 7.6,12.0 L3.8,11.6 C3.5,7.5 4.3,4.3 6.1,2.3 C7.9,0.3 10.3,-0.5 12.8,-0.2 C15.7,0.2 18.0,2.1 19.7,5.1 C22.4,9.9 24.1,17.2 24.8,26.1 C25.3,31.7 25.5,37.3 25.5,42.5 C27.9,43.7 30.0,45.5 31.4,47.8 C32.9,50.1 33.6,52.8 33.4,55.5 C33.1,59.1 31.4,62.3 28.7,64.6 C27.7,65.5 26.6,66.2 25.3,66.7 L25.3,74.5 C25.3,76.5 25.0,78.2 24.3,79.5 C23.4,81.1 22.0,82.2 20.3,82.7 C18.6,83.2 16.7,83.0 15.0,82.1 C13.3,81.2 12.0,79.6 11.4,77.7 C10.9,75.7 11.2,73.6 12.2,71.9 C13.1,70.3 14.7,69.2 16.6,68.8 C18.1,68.5 19.6,68.8 20.8,69.6 C22.0,70.5 22.7,71.8 22.7,73.3 C22.7,74.5 22.2,75.5 21.4,76.2 C20.6,76.9 19.6,77.1 18.6,76.9 C18.0,76.8 17.5,76.4 17.2,75.8 C17.0,75.3 17.0,74.7 17.3,74.2 C17.5,73.7 17.9,73.4 18.5,73.3 C18.7,73.3 19.0,73.4 19.1,73.5 C19.3,73.6 19.4,73.8 19.4,74.0 C19.4,74.2 19.2,74.5 18.8,74.5 L18.6,74.5 C17.9,74.3 17.3,74.7 17.1,75.3 C17.0,76.0 17.4,76.6 18.0,76.8 C18.8,77.0 19.7,76.8 20.3,76.2 C20.9,75.6 21.3,74.8 21.2,73.9 C21.1,72.6 20.4,71.5 19.3,70.8 C18.2,70.1 16.9,69.8 15.6,70.1 C14.0,70.5 12.6,71.5 11.8,72.9 C10.9,74.5 10.7,76.4 11.1,78.2 C11.7,80.1 12.9,81.6 14.6,82.5 C16.3,83.4 18.2,83.6 20.0,83.1 C21.9,82.6 23.5,81.3 24.5,79.5 C25.3,77.8 25.7,75.8 25.7,73.5 L25.7,64.0 L25.3,64.2 Z M20.5,43.3 C17.6,43.3 14.8,44.2 12.5,45.9 C10.2,47.7 8.7,50.2 8.2,53.1 C7.8,55.4 8.2,57.7 9.3,59.6 C10.4,61.6 12.0,63.1 14.0,64.0 C16.0,64.9 18.2,65.1 20.3,64.5 C21.4,64.2 22.4,63.6 23.3,62.8 C24.4,61.7 25.1,60.3 25.4,58.7 L25.4,46.5 C24.0,45.0 22.3,43.9 20.5,43.3 Z M25.4,56.6 C25.1,58.2 24.3,59.6 23.1,60.6 C22.0,61.5 20.6,62.0 19.2,61.9 C17.4,61.8 15.7,61.0 14.6,59.6 C13.4,58.3 12.8,56.5 13.0,54.7 C13.3,52.7 14.4,50.9 16.1,49.8 C17.4,48.9 19.0,48.5 20.5,48.6 L20.5,55.5 C20.5,56.0 20.8,56.5 21.3,56.7 C21.8,56.9 22.4,56.7 22.7,56.3 C23.0,55.9 23.0,55.3 22.6,54.9 C22.4,54.7 22.0,54.6 21.7,54.6 L21.7,48.7 C23.1,49.2 24.4,50.2 25.2,51.5 C25.8,52.5 26.0,53.7 25.9,54.9 C25.8,55.5 25.6,56.1 25.4,56.6 Z',
      bassClefBody: 'M4.2,16.5 C4.2,20.0 5.6,23.3 8.1,25.8 C10.6,28.2 14.0,29.6 17.5,29.6 C21.0,29.6 24.4,28.2 26.9,25.8 C29.4,23.3 30.8,20.0 30.8,16.5 C30.8,12.9 29.4,9.6 26.9,7.1 C24.4,4.7 21.0,3.3 17.5,3.3 C14.9,3.3 12.4,4.1 10.3,5.6 L10.0,0.5 C13.5,-0.2 17.1,-0.3 20.6,0.3 C25.5,1.2 30.0,3.7 33.3,7.4 C36.6,11.1 38.4,15.9 38.4,20.9 C38.4,26.4 36.1,31.7 32.2,35.7 C27.5,40.5 20.8,44.3 12.6,47.0 L10.6,42.5 C17.3,40.1 22.6,37.0 26.4,33.1 C29.4,30.0 31.0,25.9 31.0,21.6 C31.0,17.9 29.6,14.3 27.0,11.7 C24.4,9.1 20.9,7.6 17.2,7.6 C14.8,7.6 12.4,8.5 10.6,10.1 C8.8,11.7 7.7,14.0 7.7,16.5 L4.2,16.5 Z',
      flatAccidental: 'M2.5,0 L5.8,0 L5.8,17.8 C7.5,15.2 10.0,13.6 13.0,13.6 C17.2,13.6 20.6,16.8 20.6,22.2 C20.6,27.8 16.5,32.2 11.2,32.2 C7.5,32.2 4.6,29.8 3.5,26.2 C2.8,24.0 2.5,21.2 2.5,17.8 L2.5,0 Z M5.8,25.2 C6.6,27.5 8.6,29.2 11.0,29.2 C14.3,29.2 16.8,26.2 16.8,22.2 C16.8,18.3 14.4,16.4 11.5,16.4 C9.2,16.4 7.2,17.8 5.8,20.4 L5.8,25.2 Z',
      sharpAccidental: 'M9.2,0 L12.5,0 L12.5,7.6 L20.8,5.2 L20.8,8.8 L12.5,11.2 L12.5,21.8 L20.8,19.4 L20.8,23.0 L12.5,25.4 L12.5,33.0 L9.2,33.0 L9.2,26.4 L2.5,28.4 L2.5,24.8 L9.2,22.8 L9.2,12.2 L2.5,14.2 L2.5,10.6 L9.2,8.6 L9.2,0 Z M9.2,11.6 L2.5,13.6 L2.5,13.6 L9.2,11.6 Z M12.5,12.2 L12.5,22.8 L20.8,20.4 L20.8,20.4 L12.5,22.8 Z M9.2,12.2 L9.2,22.8 L2.5,24.8 L2.5,14.2 L9.2,12.2 Z'
    };
  }

  getPastelColor(stepIndex, factor = 0.68) {
    const noteIdx = ((stepIndex % 7) + 7) % 7;
    const base = this.pitchColors[noteIdx];
    const r = Math.round(base[0] + (255 - base[0]) * factor);
    const g = Math.round(base[1] + (255 - base[1]) * factor);
    const b = Math.round(base[2] + (255 - base[2]) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  getDarkLineColor(stepIndex) {
    const noteIdx = ((stepIndex % 7) + 7) % 7;
    const base = this.pitchColors[noteIdx];
    const r = Math.round(base[0] * 0.55 + 20 * 0.45);
    const g = Math.round(base[1] * 0.55 + 24 * 0.45);
    const b = Math.round(base[2] * 0.55 + 38 * 0.45);
    return `rgb(${r}, ${g}, ${b})`;
  }

  createStaffElement(clef, pitchName, accidental = '', options = {}) {
    const width = options.width || 380;
    const height = options.height || 140;
    const lineSpacing = 15;
    const staffTopY = 38;
    const staffBottomY = staffTopY + 4 * lineSpacing; // 98
    const startX = 22;
    const endX = width - 22;
    const cardBgColor = '#f8fafc';

    const baseRefStep = (clef === 'treble') ? 2 : -10;
    const step = this.diatonicStepMap[pitchName] !== undefined ? this.diatonicStepMap[pitchName] : 0;
    const noteY = staffBottomY - (step - baseRefStep) * (lineSpacing / 2);
    const noteX = width / 2 + 25;

    const showRainbow = options.showRainbow !== undefined ? options.showRainbow : this.showRainbow;
    const blurFilterId = `staff-rainbow-blur-${Math.random().toString(36).slice(2, 9)}`;

    const defsChildren = [];

    if (showRainbow) {
      defsChildren.push([
        'svg:filter',
        { id: blurFilterId, x: '-3%', y: '-3%', width: '106%', height: '106%' },
        [
          ['svg:feGaussianBlur', { stdDeviation: '0.6', result: 'blur' }]
        ]
      ]);
    }

    const svgChildren = [
      ['svg:defs', {}, defsChildren]
    ];

    // 1. Background Card
    svgChildren.push([
      'svg:rect',
      { x: 0, y: 0, width: width, height: height, rx: 12, fill: cardBgColor, stroke: '#334155', 'stroke-width': 1.5 }
    ]);

    // 2. Soft, balanced pastel spaces & line glows
    if (showRainbow) {
      const topStep = baseRefStep + 10;
      const botStep = baseRefStep - 3;
      const spaceStripes = [];
      const lineGlowStripes = [];

      const stripeX = startX - 2;
      const stripeW = (endX - startX) + 4;

      for (let s = botStep; s <= topStep; s++) {
        const yPos = staffBottomY - (s - baseRefStep) * (lineSpacing / 2);
        const isLineStep = ((s - baseRefStep) % 2 === 0);

        if (isLineStep) {
          const col = this.getPastelColor(s, 0.50);
          const bandHeight = 9.5;
          lineGlowStripes.push([
            'svg:rect',
            {
              x: stripeX,
              y: yPos - bandHeight / 2,
              width: stripeW,
              height: bandHeight,
              rx: 3,
              fill: col,
              opacity: '0.70'
            }
          ]);
        } else {
          const col = this.getPastelColor(s, 0.68);
          const bandHeight = 8.0;
          spaceStripes.push([
            'svg:rect',
            {
              x: stripeX,
              y: yPos - bandHeight / 2,
              width: stripeW,
              height: bandHeight,
              rx: 2,
              fill: col,
              opacity: '0.68'
            }
          ]);
        }
      }

      svgChildren.push([
        'svg:g',
        { filter: `url(#${blurFilterId})` },
        [...spaceStripes, ...lineGlowStripes]
      ]);
    }

    // 3. 5 Staff Lines
    for (let i = 0; i < 5; i++) {
      const lineStep = baseRefStep + (4 - i) * 2;
      const y = staffTopY + i * lineSpacing;
      const strokeColor = showRainbow ? this.getDarkLineColor(lineStep) : '#0f172a';
      const strokeWidth = showRainbow ? 2.0 : 1.6;

      svgChildren.push([
        'svg:line',
        { x1: startX, y1: y, x2: endX, y2: y, stroke: strokeColor, 'stroke-width': strokeWidth }
      ]);
    }

    // 4. Left and Right Bar Lines
    svgChildren.push([
      'svg:line',
      { x1: startX, y1: staffTopY, x2: startX, y2: staffBottomY, stroke: '#0f172a', 'stroke-width': 2 }
    ]);
    svgChildren.push([
      'svg:line',
      { x1: endX, y1: staffTopY, x2: endX, y2: staffBottomY, stroke: '#0f172a', 'stroke-width': 2 }
    ]);

    // 5. Clefs (High-precision SVG Vector Paths)
    if (clef === 'treble') {
      // Treble Clef centered on G line (staffTopY + 3*lineSpacing = 83)
      svgChildren.push([
        'svg:g',
        { transform: `translate(${startX + 8}, ${staffTopY - 16}) scale(0.96)` },
        [
          [
            'svg:path',
            {
              d: this.paths.trebleClef,
              fill: '#0f172a'
            }
          ]
        ]
      ]);
    } else {
      // Bass Clef with two dots centered around F line (staffTopY + lineSpacing = 53)
      const fLineY = staffTopY + lineSpacing;
      svgChildren.push([
        'svg:g',
        { transform: `translate(${startX + 12}, ${staffTopY + 3}) scale(0.88)` },
        [
          [
            'svg:path',
            {
              d: this.paths.bassClefBody,
              fill: '#0f172a'
            }
          ],
          [
            'svg:circle',
            { cx: 35, cy: 11, r: 3.2, fill: '#0f172a' }
          ],
          [
            'svg:circle',
            { cx: 35, cy: 26, r: 3.2, fill: '#0f172a' }
          ]
        ]
      ]);
    }

    // Helper for Ledger Lines
    const addLedgerLine = (ly, stepNum) => {
      const strokeColor = showRainbow ? this.getDarkLineColor(stepNum) : '#0f172a';
      svgChildren.push([
        'svg:line',
        { x1: noteX - 20, y1: ly, x2: noteX + 20, y2: ly, stroke: strokeColor, 'stroke-width': 2.2, 'stroke-linecap': 'round' }
      ]);
    };

    // 6. Ledger Lines
    if (noteY >= staffBottomY + lineSpacing) {
      for (let ly = staffBottomY + lineSpacing; ly <= noteY + 2; ly += lineSpacing) {
        const sNum = baseRefStep - Math.round((ly - staffBottomY) / (lineSpacing / 2));
        addLedgerLine(ly, sNum);
      }
    } else if (noteY <= staffTopY - lineSpacing) {
      for (let ly = staffTopY - lineSpacing; ly >= noteY - 2; ly -= lineSpacing) {
        const sNum = baseRefStep + 8 + Math.round((staffTopY - ly) / (lineSpacing / 2));
        addLedgerLine(ly, sNum);
      }
    } else if ((clef === 'treble' || clef === 'bass') && step === 0) {
      addLedgerLine(noteY, 0);
    }

    // 7. Accidental (Pure SVG Vector Path)
    if (accidental) {
      const isSharp = accidental === '#';
      if (isSharp) {
        svgChildren.push([
          'svg:g',
          { transform: `translate(${noteX - 34}, ${noteY - 14}) scale(0.92)` },
          [
            [
              'svg:path',
              {
                d: this.paths.sharpAccidental,
                fill: '#0f172a'
              }
            ]
          ]
        ]);
      } else {
        svgChildren.push([
          'svg:g',
          { transform: `translate(${noteX - 32}, ${noteY - 20}) scale(0.92)` },
          [
            [
              'svg:path',
              {
                d: this.paths.flatAccidental,
                fill: '#0f172a'
              }
            ]
          ]
        ]);
      }
    }

    // 8. Note Head
    svgChildren.push([
      'svg:ellipse',
      {
        cx: noteX,
        cy: noteY,
        rx: 9.5,
        ry: 6.8,
        fill: '#0f172a',
        transform: `rotate(-25, ${noteX}, ${noteY})`
      }
    ]);

    // 9. Note Stem
    const staffCenterY = staffTopY + 2 * lineSpacing;
    const stemUp = noteY >= staffCenterY;
    const stemLen = 44;

    if (stemUp) {
      svgChildren.push([
        'svg:line',
        { x1: noteX + 8, y1: noteY - 1, x2: noteX + 8, y2: noteY - stemLen, stroke: '#0f172a', 'stroke-width': 2.2 }
      ]);
    } else {
      svgChildren.push([
        'svg:line',
        { x1: noteX - 8, y1: noteY + 1, x2: noteX - 8, y2: noteY + stemLen, stroke: '#0f172a', 'stroke-width': 2.2 }
      ]);
    }

    return makeElement('svg:svg', {
      viewBox: `0 0 ${width} ${height}`,
      width: '100%',
      height: '100%',
      style: { display: 'block', maxHeight: '100%', maxWidth: '100%' }
    }, svgChildren);
  }
}

globalThis.StaffView = StaffView;
if (typeof module !== 'undefined' && module.exports) module.exports = StaffView;