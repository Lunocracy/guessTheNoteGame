class GameBox {
  constructor() {
    this.noteSpans = [];
    this.staffView = new StaffView();
    this.currentMode = 'EAR_TRAINING';
    this.config = {
      noteBaseFontSize: 400,
      feedbackBaseFontSize: 30,
      buttonBaseFontSize: 18,
      playAgainBaseFontSize: 16,
    };
  }

  start(rootElement, onModeChange) {
    this.onModeChange = onModeChange;
    this.div = makeElement('div', {
      style: {
        position: 'absolute',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        color: 'white',
        zIndex: '10',
        borderRadius: '14px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '"Architects Daughter", Arial, sans-serif',
        overflow: 'hidden',
        boxSizing: 'border-box',
      },
      className: 'game-box',
    });
    if (rootElement) rootElement.appendChild(this.div);

    this.positioner = new SmartElementPositioner(this.div, {
      container: rootElement,
      position: [7.5, 7],
      size: [85, 30],
      aspectRatio: null,
      sizeCallback: (self, pixelDims) => {
        const fontScale = Math.min(pixelDims.width / 400, pixelDims.height / 200);

        if (this.modeSwitcher) {
          const modeBtnFontSize = Math.max(11, 13 * fontScale);
          this.modeSwitcher.querySelectorAll('button').forEach((b) => {
            b.style.fontSize = `${modeBtnFontSize}px`;
          });
        }

        const feedbackHeight = pixelDims.height * 0.18;
        const feedbackFontSize = Math.max(14, this.config.feedbackBaseFontSize * fontScale);
        this.feedbackText.style.height = `${feedbackHeight}px`;
        this.feedbackText.style.lineHeight = `${feedbackHeight}px`;
        this.feedbackText.style.fontSize = `${feedbackFontSize}px`;
        this.feedbackText.style.width = '100%';

        const middleSlotHeight = pixelDims.height * 0.52;
        this.noteDisplay.style.height = `${middleSlotHeight}px`;
        this.noteDisplay.style.width = '100%';

        this.staffDisplay.style.height = `${middleSlotHeight}px`;
        this.staffDisplay.style.width = '100%';

        const numSpans = this.noteSpans.length || 3;
        const noteSpanWidthPixels = Math.min(pixelDims.width / (numSpans + 0.5), pixelDims.width * 0.22);
        const noteFontSize = Math.max(22, middleSlotHeight * 0.5);
        this.noteSpans.forEach((span) => {
          span.style.width = `${noteSpanWidthPixels}px`;
          span.style.height = `${middleSlotHeight}px`;
          span.style.lineHeight = `${middleSlotHeight}px`;
          span.style.fontSize = `${noteFontSize}px`;
          span.style.transformOrigin = 'center center';
        });

        const buttonSlotHeightPixels = pixelDims.height * 0.2;
        this.buttonSlot.style.height = `${buttonSlotHeightPixels}px`;
        this.buttonSlot.style.width = '100%';
        this.buttonSlot.style.justifyContent = 'center';
        const startButtonHeight = buttonSlotHeightPixels * 0.85;
        const startButtonFontSize = Math.max(11, this.config.buttonBaseFontSize * fontScale * 0.9);
        const startButtonPadding = Math.max(3, startButtonHeight * 0.1);

        this.startButton.style.height = `${startButtonHeight}px`;
        this.startButton.style.fontSize = `${startButtonFontSize}px`;
        this.startButton.style.padding = `${startButtonPadding}px ${startButtonPadding * 1.5}px`;

        if (this.startTwoPlayerButton) {
          this.startTwoPlayerButton.style.height = `${startButtonHeight}px`;
          this.startTwoPlayerButton.style.fontSize = `${startButtonFontSize}px`;
          this.startTwoPlayerButton.style.padding = `${startButtonPadding}px ${startButtonPadding * 1.5}px`;
        }

        const playAgainButtonHeight = buttonSlotHeightPixels * 0.7;
        const playAgainButtonFontSize = Math.max(10, this.config.playAgainBaseFontSize * fontScale);
        const playAgainPaddingVertical = Math.max(2, playAgainButtonHeight * 0.1);
        const playAgainPaddingHorizontal = Math.max(5, playAgainButtonFontSize * 0.6);
        this.playAgainButton.style.height = `${playAgainButtonHeight}px`;
        this.playAgainButton.style.fontSize = `${playAgainButtonFontSize}px`;
        this.playAgainButton.style.width = 'auto';
        this.playAgainButton.style.padding = `${playAgainPaddingVertical}px ${playAgainPaddingHorizontal}px`;
        const cornerOffset = Math.max(5, pixelDims.height * 0.03);
        this.playAgainButton.style.bottom = `${cornerOffset}px`;
        this.playAgainButton.style.right = `${cornerOffset}px`;
      },
    });

    this.modeSwitcher = makeElement('div', {
      className: 'mode-toggle-group',
      style: {
        display: 'inline-flex',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        background: 'rgba(0, 0, 0, 0.5)',
        flexShrink: '0',
        marginTop: '4px',
      },
    });

    this.earModeBtn = makeElement('button', {
      textContent: '👂 Ear Training',
      className: 'v-btn-mode active',
      onclick: () => this.selectMode('EAR_TRAINING'),
    });
    this.staffModeBtn = makeElement('button', {
      textContent: '🎼 Staff Reading',
      className: 'v-btn-mode',
      onclick: () => this.selectMode('STAFF_READING'),
    });
    this.modeSwitcher.appendChild(this.earModeBtn);
    this.modeSwitcher.appendChild(this.staffModeBtn);
    this.div.appendChild(this.modeSwitcher);

    this.feedbackText = makeElement('p', {
      className: 'feedbackText',
      textContent: 'guess the note...',
      style: {
        visibility: 'visible',
        margin: '0',
        padding: '0 5px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        flexShrink: '0',
        textAlign: 'center',
      },
    });
    this.div.appendChild(this.feedbackText);

    this.noteDisplay = makeElement('div', {
      className: 'noteDisplay',
      style: {
        visibility: 'hidden',
        margin: '0',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        alignItems: 'center',
        width: '100%',
        flexGrow: '1',
      },
    });
    this.div.appendChild(this.noteDisplay);

    this.staffDisplay = makeElement('div', {
      className: 'staffDisplay',
      style: {
        display: 'none',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: '1',
      },
    });
    this.div.appendChild(this.staffDisplay);

    this.buttonSlot = makeElement('div', {
      id: 'button-slot',
      style: {
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexShrink: '0',
        gap: '10px',
      },
    });
    this.div.appendChild(this.buttonSlot);

    this.startButton = makeElement('button', {
      id: 'startButton',
      textContent: 'Single Player',
      style: { visibility: 'visible', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    });
    this.buttonSlot.appendChild(this.startButton);

    this.startTwoPlayerButton = makeElement('button', {
      id: 'startTwoPlayerButton',
      textContent: '2-Player Game',
      style: { visibility: 'visible', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    });
    this.buttonSlot.appendChild(this.startTwoPlayerButton);

    this.playAgainButton = makeElement('button', {
      id: 'playAgainButton',
      textContent: 'Play Notes Again',
      style: {
        position: 'absolute',
        visibility: 'hidden',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      },
    });
    this.div.appendChild(this.playAgainButton);

    this.positioner.update();
  }

  selectMode(mode) {
    this.currentMode = mode;
    if (mode === 'EAR_TRAINING') {
      this.earModeBtn.classList.add('active');
      this.staffModeBtn.classList.remove('active');
      this.staffDisplay.style.display = 'none';
      this.noteDisplay.style.display = 'flex';
      this.startTwoPlayerButton.style.display = 'inline-flex';
      this.startButton.textContent = 'Single Player';
      this.feedbackText.textContent = 'guess the note...';
    } else {
      this.staffModeBtn.classList.add('active');
      this.earModeBtn.classList.remove('active');
      this.noteDisplay.style.display = 'none';
      this.staffDisplay.style.display = 'flex';
      this.startTwoPlayerButton.style.display = 'none';
      this.startButton.textContent = 'Start Staff Reading';
      this.feedbackText.textContent = 'Play the note shown on staff!';
    }
    if (this.onModeChange) this.onModeChange(mode);
    if (this.positioner) this.positioner.update();
  }

  displayStaffNote(clef, pitchName, accidental = '') {
    this.staffDisplay.innerHTML = '';
    const staffSvg = this.staffView.createStaffElement(clef, pitchName, accidental, { width: 380, height: 135 });
    this.staffDisplay.appendChild(staffSvg);
    this.staffDisplay.style.display = 'flex';
    if (this.positioner) this.positioner.update();
  }

  displayNotes(midiSequence, hiddenIndex = 2, showAll = false) {
    this.noteDisplay.innerHTML = '';
    this.noteSpans = [];

    midiSequence.forEach((midiCode, i) => {
      const keyIndex = (midiCode - 12) % 12;
      const key = PianoUtils.PianoKeys.dims[keyIndex];
      const prevKeyIndex = (keyIndex - 1 + 12) % 12;
      const prevKey = PianoUtils.PianoKeys.dims[prevKeyIndex];

      const baseSpan = makeElement('span', {
        style: {
          display: 'inline',
          verticalAlign: 'middle',
          fontFamily: 'inherit',
          visibility: 'inherit',
        },
      });
      const sharpSpan = makeElement('span', {
        textContent: '♯',
        style: {
          display: 'inline',
          verticalAlign: 'middle',
          fontFamily: 'inherit',
          textShadow: '-1px -1px 1px white, 2px 2px 4px black',
          visibility: 'inherit',
        },
      });
      sharpSpan.style.color = PianoUtils.rgbToHex(
        PianoUtils.toPastel(PianoUtils.getSharpColor(midiCode))
      );

      if (!key.black) {
        baseSpan.textContent = key.name;
        baseSpan.style.color = PianoUtils.rgbToHex(
          PianoUtils.toPastel(key.color)
        );
        baseSpan.style.textShadow =
          i !== hiddenIndex ? '-1px -1px 1px white, 2px 2px 4px black' : '1px 1px 2px #666';
      } else {
        baseSpan.textContent = prevKey.name;
        baseSpan.style.color = PianoUtils.rgbToHex(
          PianoUtils.toPastel(prevKey.color)
        );
        baseSpan.style.textShadow =
          i !== hiddenIndex ? '-1px -1px 1px white, 2px 2px 4px black' : '1px 1px 2px #666';
        baseSpan.appendChild(sharpSpan);
      }

      const wrapperSpan = makeElement('span', {
        style: {
          visibility: 'hidden',
          display: 'inline-block',
          textAlign: 'center',
          verticalAlign: 'middle',
          fontFamily: '"Architects Daughter", Arial, sans-serif',
          boxSizing: 'border-box',
          overflow: 'visible',
        },
      });

      if (i !== hiddenIndex || showAll) {
        wrapperSpan.appendChild(baseSpan);
      } else {
        const questionSpan = makeElement('span', {
          textContent: '?',
          style: {
            display: 'inline',
            verticalAlign: 'middle',
            fontFamily: 'inherit',
            visibility: 'inherit',
          },
        });
        wrapperSpan.appendChild(questionSpan);
        wrapperSpan.className = 'missing-note';
        questionSpan.style.color = '#ccc';
        questionSpan.style.textShadow = '1px 1px 2px #333';
      }
      this.noteDisplay.appendChild(wrapperSpan);
      this.noteSpans.push(wrapperSpan);
    });
    this.noteDisplay.style.visibility = 'visible';
    this.playAgainButton.style.visibility = 'hidden';
    this.positioner.update();
  }

  updateNoteDisplay(index, midiCode, isCorrect = false) {
    if (index < 0 || index >= this.noteSpans.length) return;
    const keyIndex = (midiCode - 12) % 12;
    const key = PianoUtils.PianoKeys.dims[keyIndex];
    const prevKeyIndex = (keyIndex - 1 + 12) % 12;
    const prevKey = PianoUtils.PianoKeys.dims[prevKeyIndex];
    const span = this.noteSpans[index];
    span.innerHTML = '';
    const baseSpan = makeElement('span', {
      style: {
        display: 'inline',
        verticalAlign: 'middle',
        fontFamily: 'inherit',
        textShadow: '-1px -1px 1px white, 2px 2px 4px black',
        visibility: 'inherit',
      },
    });
    const sharpSpan = makeElement('span', {
      textContent: '♯',
      style: {
        display: 'inline',
        verticalAlign: 'middle',
        fontFamily: 'inherit',
        textShadow: '-1px -1px 1px white, 2px 2px 4px black',
        visibility: 'inherit',
      },
    });
    sharpSpan.style.color = PianoUtils.rgbToHex(
      PianoUtils.toPastel(PianoUtils.getSharpColor(midiCode))
    );

    if (!key.black) {
      baseSpan.textContent = key.name;
      baseSpan.style.color = PianoUtils.rgbToHex(
        PianoUtils.toPastel(key.color)
      );
    } else {
      baseSpan.textContent = prevKey.name;
      baseSpan.style.color = PianoUtils.rgbToHex(
        PianoUtils.toPastel(prevKey.color)
      );
      baseSpan.appendChild(sharpSpan);
    }
    span.appendChild(baseSpan);
    span.style.visibility = 'visible';
    span.className = '';
    span.style.color = 'inherit';
    span.style.textShadow = 'inherit';
    this.positioner.update();
  }

  updateUI(state) {
    const isIdle = state === 'IDLE';
    this.startButton.style.visibility = isIdle ? 'visible' : 'hidden';
    if (this.startTwoPlayerButton) {
      this.startTwoPlayerButton.style.visibility =
        isIdle && this.currentMode === 'EAR_TRAINING' ? 'visible' : 'hidden';
    }

    const promptDivHasCorrectClass = this.getPromptDiv()?.classList.contains('correct');
    this.playAgainButton.style.visibility =
      this.currentMode === 'EAR_TRAINING' &&
      (state === 'GUESSING' || (state === 'FEEDBACK' && !promptDivHasCorrectClass))
        ? 'visible'
        : 'hidden';

    if (this.currentMode === 'EAR_TRAINING') {
      const notesGenerated = this.noteSpans.length > 0;
      this.noteDisplay.style.visibility =
        notesGenerated && ['PLAYING', 'GUESSING', 'FEEDBACK'].includes(state)
          ? 'visible'
          : 'hidden';
      this.staffDisplay.style.display = 'none';
    } else {
      this.noteDisplay.style.display = 'none';
      this.staffDisplay.style.display = state === 'IDLE' ? 'none' : 'flex';
    }

    this.feedbackText.style.visibility = 'visible';
    requestAnimationFrame(() => {
      if (this.positioner) this.positioner.update();
    });
  }

  static midiToNote(midi) {
    const noteNames = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ];
    const octave = Math.floor((midi - 12) / 12);
    const noteIndex = (midi - 12) % 12;
    return `${noteNames[noteIndex]}${octave}`;
  }

  getPromptDiv() { return this.div; }
  getStartButton() { return this.startButton; }
  getPlayAgainButton() { return this.playAgainButton; }
  setFeedbackText(text, visibility = 'visible') {
    this.feedbackText.textContent = text;
    this.feedbackText.style.visibility = visibility;
  }
  getNoteSpans() { return this.noteSpans; }
  getStartTwoPlayerButton() { return this.startTwoPlayerButton; }
}

globalThis.GameBox = GameBox;
if (typeof module !== 'undefined' && module.exports) module.exports = GameBox;