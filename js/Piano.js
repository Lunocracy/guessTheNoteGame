class Piano {
  constructor() {
    this.settings = {
      keyWidth: 20,
      keyHeight: 30,
      keySpacing: 5,
      whiteKeyColor: '#e0e0e0',
      blackKeyColor: '#505050',
      fullStartMidi: 33,
      fullEndMidi: 88,
      gameStartMidi: 60,
      gameEndMidi: 71,
      padding: [10, 10],
    };

    this.containerDiv = this.createContainerDiv();
    this.svgElement = this.createSvgElement();
    this.containerDiv.appendChild(this.svgElement);

    this.graphicPiano = new GraphicPiano(this.svgElement, {
      startMidi: this.settings.fullStartMidi,
      endMidi: this.settings.fullEndMidi,
      padding: this.settings.padding,
      blackKeyHeightRatio: 0.55,
      cornerRadius: 5,
      keySpacing: this.settings.keySpacing,
    });
    this.glowPiano = new GlowPiano(this.graphicPiano);

    this.gameRange = {
      startMidi: this.settings.gameStartMidi,
      endMidi: this.settings.gameEndMidi,
    };

    this.middleCIndicator = null;
    this.showMiddleCMarker = false;
  }

  createContainerDiv() {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.overflow = 'hidden';
    container.style.transition = 'left 0.35s ease';
    return container;
  }

  createSvgElement() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    return svg;
  }

  setGameInstance(gameInstance) {
    this.gameInstance = gameInstance;
    this.glowPiano.setNoteCallback((midi, eventType, customData) => {
      this.gameInstance.handleNoteEvent(midi, eventType, customData);
    });
  }

  setupMiddleCMarker() {
    if (this.middleCIndicator && this.middleCIndicator.parentElement) {
      this.middleCIndicator.remove();
    }

    const keyData = this.graphicPiano?.getKeyByMidi?.(60);
    if (!keyData || !keyData.bbox) return;

    this.middleCIndicator = makeElement('div', {
      className: 'middle-c-marker',
      title: 'Middle C (C4)',
      style: {
        position: 'absolute',
        zIndex: '15',
        pointerEvents: 'none',
        display: this.showMiddleCMarker ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: '0.85',
        transition: 'opacity 0.2s ease',
      }
    }, [
      makeElement('div', {
        textContent: '▲',
        style: { fontSize: '11px', color: '#00f2fe', lineHeight: '1', textShadow: '0 0 4px #00f2fe' }
      }),
      makeElement('div', {
        textContent: 'C4',
        style: {
          fontSize: '9px',
          fontWeight: 'bold',
          color: '#ffffff',
          background: 'rgba(0, 180, 255, 0.75)',
          padding: '1px 3px',
          borderRadius: '3px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }
      })
    ]);

    this.addOverlayElement(60, this.middleCIndicator, { bottomOffset: 30 });
  }

  setMiddleCMarkerVisibility(visible) {
    this.showMiddleCMarker = visible;
    if (this.middleCIndicator) {
      this.middleCIndicator.style.display = visible ? 'flex' : 'none';
    } else if (visible) {
      this.setupMiddleCMarker();
    }
  }

  setSizeAndPosition(containerWidth, containerHeight, skipInit) {
    if (!containerWidth || !containerHeight) return;

    let totalWhiteKeys = 0;
    for (let m = this.settings.fullStartMidi; m <= this.settings.fullEndMidi; m++) {
      const keyIndex = m % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(keyIndex);
      if (!isBlack) totalWhiteKeys++;
    }

    let targetKeyWidth = containerHeight * 0.22;
    let visibleWhiteKeys = containerWidth / targetKeyWidth;

    let gameRangeWhiteKeys = 0;
    for (let m = this.gameRange.startMidi; m <= this.gameRange.endMidi; m++) {
      const isBlack = [1, 3, 6, 8, 10].includes(m % 12);
      if (!isBlack) gameRangeWhiteKeys++;
    }

    const minVisible = Math.max(7, gameRangeWhiteKeys);

    if (visibleWhiteKeys < minVisible) {
      visibleWhiteKeys = minVisible;
      targetKeyWidth = containerWidth / visibleWhiteKeys;
    } else if (visibleWhiteKeys > totalWhiteKeys) {
      visibleWhiteKeys = totalWhiteKeys;
      const maxKeyWidth = containerHeight * 0.30;
      const fillWidth = containerWidth / totalWhiteKeys;
      targetKeyWidth = Math.min(maxKeyWidth, fillWidth);
    }

    const svgWidth = targetKeyWidth * totalWhiteKeys;
    const svgHeight = containerHeight;

    this.containerDiv.style.width = `${svgWidth}px`;
    this.containerDiv.style.height = `${svgHeight}px`;

    if (!skipInit) {
      this.graphicPiano.updateSize(svgWidth, svgHeight);
      this.glowPiano.initialize();
      this.setupMiddleCMarker();
    }

    let gameRangeWhiteKeyCountBefore = 0;
    for (let m = this.settings.fullStartMidi; m < this.gameRange.startMidi; m++) {
      const isBlack = [1, 3, 6, 8, 10].includes(m % 12);
      if (!isBlack) gameRangeWhiteKeyCountBefore++;
    }

    const startPixel = gameRangeWhiteKeyCountBefore * targetKeyWidth;
    const rangeWidthPixel = gameRangeWhiteKeys * targetKeyWidth;
    const centerPixel = startPixel + rangeWidthPixel / 2;

    let leftOffset = containerWidth / 2 - centerPixel;

    if (svgWidth <= containerWidth) {
      leftOffset = (containerWidth - svgWidth) / 2;
    } else {
      const minOffset = containerWidth - svgWidth;
      const maxOffset = 0;
      leftOffset = Math.max(minOffset, Math.min(maxOffset, leftOffset));
    }

    this.containerDiv.style.left = `${leftOffset}px`;
  }

  centerOnMidi(midi, randomize = true) {
    if (!this.containerDiv || !this.containerDiv.parentElement || !this.graphicPiano) return;
    const parentContainer = this.containerDiv.parentElement;
    const containerWidth = parentContainer.offsetWidth;
    if (!containerWidth) return;

    const keyData = this.graphicPiano.getKeyByMidi ? this.graphicPiano.getKeyByMidi(midi) : null;
    if (!keyData || !keyData.bbox) return;

    const keyCenterX = keyData.bbox.position[0] + keyData.bbox.size[0] / 2;
    const svgWidth = parseFloat(this.containerDiv.style.width) || containerWidth;

    if (svgWidth <= containerWidth) {
      this.containerDiv.style.transition = 'left 0.35s ease';
      this.containerDiv.style.left = `${(containerWidth - svgWidth) / 2}px`;
      return;
    }

    const minOffset = containerWidth - svgWidth;
    const maxOffset = 0;
    const pad = Math.min(80, containerWidth * 0.15);

    const rangeMin = Math.max(minOffset, pad - keyCenterX);
    const rangeMax = Math.min(maxOffset, containerWidth - pad - keyCenterX);

    let leftOffset;
    if (rangeMin <= rangeMax) {
      if (randomize) {
        leftOffset = rangeMin + Math.random() * (rangeMax - rangeMin);
      } else {
        leftOffset = (rangeMin + rangeMax) / 2;
      }
    } else {
      leftOffset = Math.max(minOffset, Math.min(maxOffset, containerWidth / 2 - keyCenterX));
    }

    this.containerDiv.style.transition = 'left 0.35s ease';
    this.containerDiv.style.left = `${leftOffset}px`;
  }

  setGameRange(startMidi, endMidi) {
    startMidi = Math.max(
      this.settings.fullStartMidi,
      Math.min(this.settings.fullEndMidi - 11, startMidi)
    );
    endMidi = startMidi + 11;
    this.gameRange = { startMidi, endMidi };

    if (this.containerDiv.parentElement) {
      this.setSizeAndPosition(
        this.containerDiv.parentElement.offsetWidth,
        this.containerDiv.parentElement.offsetHeight,
        true
      );
    }
  }

  addOverlayElement(midi, element, options = {}) {
    const keyData = this.graphicPiano?.getKeyByMidi?.(midi);
    if (!keyData || !keyData.bbox) return;

    const {
      position: [x, y],
      size: [width, height],
    } = keyData.bbox;

    element.style.position = 'absolute';
    element.style.left = `${x + width / 2}px`;
    element.style.transform = 'translateX(-50%)';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '10';
    element.style.fontFamily = '"Architects Daughter", Arial, sans-serif';

    const elementHeight =
      parseFloat(element.style.height) ||
      (element.tagName.toLowerCase() === 'svg' ? 50 : 48);
    const bottomOffset = options.bottomOffset !== undefined ? options.bottomOffset : 5;
    element.style.top = `${y + height - elementHeight - bottomOffset}px`;

    if (options.color) element.style.color = options.color;
    if (options.fontSize) element.style.fontSize = options.fontSize;
    if (options.textShadow) element.style.textShadow = options.textShadow;

    this.containerDiv.appendChild(element);
  }

  removeOverlayElement(element) {
    if (this.containerDiv && element && this.containerDiv.contains(element)) {
      this.containerDiv.removeChild(element);
    }
  }

  getContainer() {
    return this.containerDiv;
  }
}

globalThis.Piano = Piano;
if (typeof module !== 'undefined' && module.exports) module.exports = Piano;