class StaffView {
  constructor() {
    this.diatonicStepMap = {
      'C2': -14, 'D2': -13, 'E2': -12, 'F2': -11, 'G2': -10, 'A2': -9, 'B2': -8,
      'C3': -7,  'D3': -6,  'E3': -5,  'F3': -4,  'G3': -3,  'A3': -2, 'B3': -1,
      'C4': 0,   'D4': 1,   'E4': 2,   'F4': 3,   'G4': 4,   'A4': 5,  'B4': 6,
      'C5': 7,   'D5': 8,   'E5': 9,   'F5': 10,  'G5': 11,  'A5': 12, 'B5': 13,
      'C6': 14,  'D6': 15,  'E6': 16
    };
  }

  createStaffElement(clef, pitchName, accidental = '', options = {}) {
    const width = options.width || 380;
    const height = options.height || 140;
    const lineSpacing = 15;
    const staffTopY = 38;
    const staffBottomY = staffTopY + 4 * lineSpacing; // 98
    const startX = 20;
    const endX = width - 20;

    const baseRefStep = (clef === 'treble') ? 2 : -10;
    const step = this.diatonicStepMap[pitchName] !== undefined ? this.diatonicStepMap[pitchName] : 0;
    const noteY = staffBottomY - (step - baseRefStep) * (lineSpacing / 2);
    const noteX = width / 2 + 25;

    const svgChildren = [];

    // Background Card
    svgChildren.push([
      'svg:rect',
      { x: 0, y: 0, width: width, height: height, rx: 12, fill: '#f8fafc', stroke: '#334155', 'stroke-width': 1.5 }
    ]);

    // 5 Staff Lines
    for (let i = 0; i < 5; i++) {
      const y = staffTopY + i * lineSpacing;
      svgChildren.push([
        'svg:line',
        { x1: startX, y1: y, x2: endX, y2: y, stroke: '#1e293b', 'stroke-width': 1.5 }
      ]);
    }

    // Left and Right Bar Lines
    svgChildren.push([
      'svg:line',
      { x1: startX, y1: staffTopY, x2: startX, y2: staffBottomY, stroke: '#1e293b', 'stroke-width': 2 }
    ]);
    svgChildren.push([
      'svg:line',
      { x1: endX, y1: staffTopY, x2: endX, y2: staffBottomY, stroke: '#1e293b', 'stroke-width': 2 }
    ]);

    // Clefs
    if (clef === 'treble') {
      svgChildren.push([
        'svg:text',
        {
          x: startX + 28,
          y: staffTopY + 54,
          'font-family': "'Times New Roman', serif",
          'font-size': '72px',
          fill: '#0f172a',
          'text-anchor': 'middle',
          'user-select': 'none'
        },
        '𝄞'
      ]);
    } else {
      svgChildren.push([
        'svg:text',
        {
          x: startX + 28,
          y: staffTopY + 38,
          'font-family': "'Times New Roman', serif",
          'font-size': '52px',
          fill: '#0f172a',
          'text-anchor': 'middle',
          'user-select': 'none'
        },
        '𝄢'
      ]);
    }

    // Ledger Lines
    if (noteY >= staffBottomY + lineSpacing) {
      for (let ly = staffBottomY + lineSpacing; ly <= noteY + 2; ly += lineSpacing) {
        svgChildren.push([
          'svg:line',
          { x1: noteX - 20, y1: ly, x2: noteX + 20, y2: ly, stroke: '#1e293b', 'stroke-width': 1.8 }
        ]);
      }
    } else if (noteY <= staffTopY - lineSpacing) {
      for (let ly = staffTopY - lineSpacing; ly >= noteY - 2; ly -= lineSpacing) {
        svgChildren.push([
          'svg:line',
          { x1: noteX - 20, y1: ly, x2: noteX + 20, y2: ly, stroke: '#1e293b', 'stroke-width': 1.8 }
        ]);
      }
    } else if (clef === 'treble' && step === 0) {
      svgChildren.push([
        'svg:line',
        { x1: noteX - 20, y1: noteY, x2: noteX + 20, y2: noteY, stroke: '#1e293b', 'stroke-width': 1.8 }
      ]);
    } else if (clef === 'bass' && step === 0) {
      svgChildren.push([
        'svg:line',
        { x1: noteX - 20, y1: noteY, x2: noteX + 20, y2: noteY, stroke: '#1e293b', 'stroke-width': 1.8 }
      ]);
    }

    // Accidental
    if (accidental) {
      const symbol = accidental === '#' ? '♯' : accidental === 'b' ? '♭' : '♮';
      const offY = accidental === 'b' ? 4 : 7;
      svgChildren.push([
        'svg:text',
        {
          x: noteX - 28,
          y: noteY + offY,
          'font-family': "'Times New Roman', serif",
          'font-size': '30px',
          fill: '#0f172a',
          'font-weight': 'bold',
          'text-anchor': 'middle'
        },
        symbol
      ]);
    }

    // Note Head
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

    // Note Stem
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