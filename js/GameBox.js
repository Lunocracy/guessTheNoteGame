class GameBox {
  constructor() {
    this.noteSpans = [];
    this.staffView = new StaffView();
    this.currentMode = 'EAR_TRAINING';
    this.lastStaffNoteParams = null;
    this.config = {
      noteBaseFontSize: 400,
      feedbackBaseFontSize: 24,
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
        overflow: 'visible',
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

        const feedbackHeight = pixelDims.height * 0.16;
        const feedbackFontSize = Math.max(13, this.config.feedbackBaseFontSize * fontScale);
        this.feedbackText.style.height = `${feedbackHeight}px`;
        this.feedbackText.style.lineHeight = `${feedbackHeight}px`;
        this.feedbackText.style.fontSize = `${feedbackFontSize}px`;
        this.feedbackText.style.width = '100%';

        const middleSlotHeight = pixelDims.height * 0.54;
        this.noteDisplay.style.height = `${middleSlotHeight}px`;
        this.noteDisplay.style.width = '100%';

        this.staffDisplayWrapper.style.height = `${middleSlotHeight}px`;
        this.staffDisplayWrapper.style.width = '100%';

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

    const topHeaderBar = makeElement('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        marginTop: '4px',
        flexShrink: '0',
      }
    });

    this.modeSwitcher = makeElement('div', {
      className: 'mode-toggle-group',
      style: {
        display: 'inline-flex',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        background: 'rgba(0, 0, 0, 0.5)',
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
    topHeaderBar.appendChild(this.modeSwitcher);

    this.rainbowToggleBtn = makeElement('button', {
      textContent: '🌈',
      title: 'Toggle Staff Rainbow Spectrum',
      className: 'rainbow-toggle-btn active',
      style: {
        display: 'none',
        background: 'rgba(2, 132, 199, 0.4)',
        border: '1px solid #00f2fe',
        borderRadius: '8px',
        padding: '3px 8px',
        cursor: 'pointer',
        fontSize: '14px',
        lineHeight: '1',
        transition: 'all 0.15s ease',
      },
      onclick: () => this.toggleRainbowMode(),
    });
    topHeaderBar.appendChild(this.rainbowToggleBtn);

    this.div.appendChild(topHeaderBar);

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

    this.staffDisplayWrapper = makeElement('div', {
      className: 'staffDisplayWrapper',
      style: {
        position: 'relative',
        display: 'none',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: '1',
      }
    });

    this.staffDisplay = makeElement('div', {
      className: 'staffDisplay',
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }
    });
    this.staffDisplayWrapper.appendChild(this.staffDisplay);

    // Superimposed badge with single-color representation matching note letter
    this.superimposedSuccessBadge = makeElement('div', {
      className: 'superimposed-success-badge',
      style: {
        position: 'absolute',
        bottom: '-38px',
        left: '50%',
        transform: 'translate(-50%, 0) scale(0.6)',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '50',
        transition: 'all 0.22s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.30)',
        border: 'none',
        borderRadius: '12px',
        padding: '2px 18px 4px 18px',
        boxShadow: 'none',
        fontFamily: '"Architects Daughter", Arial, sans-serif',
        fontSize: '44px',
        fontWeight: 'bold',
        lineHeight: '0.85',
      }
    });
    this.div.appendChild(this.superimposedSuccessBadge);

    this.div.appendChild(this.staffDisplayWrapper);

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

  showStaffNoteSuccessOverlay(midiCode, enharmonicInfo = null) {
    const diatonicLetterOffsets = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

    let letterName = '';
    let isFlat = false;
    let isSharp = false;
    let rootColorMidi = midiCode;

    if (enharmonicInfo) {
      letterName = enharmonicInfo.name.toLowerCase();
      isFlat = (enharmonicInfo.accidental === 'b');
      isSharp = (enharmonicInfo.accidental === '#');
      const letterUpper = enharmonicInfo.name.toUpperCase();
      const semitoneOffset = diatonicLetterOffsets[letterUpper] !== undefined ? diatonicLetterOffsets[letterUpper] : (midiCode % 12);
      rootColorMidi = 60 + semitoneOffset;
    } else {
      const keyIndex = (midiCode - 12) % 12;
      const key = PianoUtils.PianoKeys.dims[keyIndex];
      const prevKeyIndex = (keyIndex - 1 + 12) % 12;
      const prevKey = PianoUtils.PianoKeys.dims[prevKeyIndex];
      if (!key.black) {
        letterName = key.name.toLowerCase();
        rootColorMidi = midiCode;
      } else {
        letterName = prevKey.name.toLowerCase();
        isSharp = true;
        rootColorMidi = midiCode - 1;
      }
    }

    // Single unified color representing the root letter name
    const singleColorRgb = PianoUtils.getNoteColor(rootColorMidi);
    const singleColorHex = PianoUtils.rgbToHex(PianoUtils.toPastel(singleColorRgb));

    this.superimposedSuccessBadge.innerHTML = '';

    const baseSpan = makeElement('span', {
      textContent: letterName,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'inherit',
        color: singleColorHex,
        transform: 'translateY(-2px)',
        textShadow: '-2px -2px 1px white, 3px 3px 6px black',
      }
    });

    if (isFlat || isSharp) {
      const accidentalSpan = makeElement('span', {
        textContent: isFlat ? '♭' : '♯',
        style: {
          display: 'inline-block',
          verticalAlign: 'middle',
          color: singleColorHex,
          fontFamily: isFlat ? "'Times New Roman', serif" : 'inherit',
          fontSize: isFlat ? '0.78em' : '0.88em',
          marginLeft: '1px',
          transform: isFlat ? 'translateY(-1px)' : 'translateY(-2px)',
          textShadow: '-2px -2px 1px white, 3px 3px 6px black',
        }
      });
      baseSpan.appendChild(accidentalSpan);
    }

    this.superimposedSuccessBadge.appendChild(baseSpan);
    this.superimposedSuccessBadge.style.opacity = '1';
    this.superimposedSuccessBadge.style.transform = 'translate(-50%, 0) scale(1.0)';

    setTimeout(() => {
      this.superimposedSuccessBadge.style.opacity = '0';
      this.superimposedSuccessBadge.style.transform = 'translate(-50%, 0) scale(0.6)';
    }, 1100);
  }

  toggleRainbowMode() {
    this.staffView.showRainbow = !this.staffView.showRainbow;
    this.rainbowToggleBtn.style.background = this.staffView.showRainbow
      ? 'rgba(2, 132, 199, 0.4)'
      : 'rgba(255, 255, 255, 0.08)';
    this.rainbowToggleBtn.style.borderColor = this.staffView.showRainbow
      ? '#00f2fe'
      : 'rgba(255, 255, 255, 0.2)';

    if (this.lastStaffNoteParams) {
      this.displayStaffNote(
        this.lastStaffNoteParams.clef,
        this.lastStaffNoteParams.pitchName,
        this.lastStaffNoteParams.accidental
      );
    }
  }

  selectMode(mode) {
    this.currentMode = mode;
    if (mode === 'EAR_TRAINING') {
      this.earModeBtn.classList.add('active');
      this.staffModeBtn.classList.remove('active');
      this.staffDisplayWrapper.style.display = 'none';
      this.noteDisplay.style.display = 'flex';
      this.startTwoPlayerButton.style.display = 'inline-flex';
      this.startButton.textContent = 'Single Player';
      this.feedbackText.textContent = 'guess the note...';
      this.rainbowToggleBtn.style.display = 'none';
      this.playAgainButton.textContent = 'Play Notes Again';
    } else {
      this.staffModeBtn.classList.add('active');
      this.earModeBtn.classList.remove('active');
      this.noteDisplay.style.display = 'none';
      this.staffDisplayWrapper.style.display = 'flex';
      this.startTwoPlayerButton.style.display = 'none';
      this.startButton.textContent = 'Start Staff Reading';
      this.feedbackText.textContent = 'play the note...';
      this.rainbowToggleBtn.style.display = 'inline-flex';
      this.playAgainButton.style.visibility = 'hidden';
    }
    if (this.onModeChange) this.onModeChange(mode);
    if (this.positioner) this.positioner.update();
  }

  displayStaffNote(clef, pitchName, accidental = '') {
    this.lastStaffNoteParams = { clef, pitchName, accidental };
    this.staffDisplay.innerHTML = '';
    const staffSvg = this.staffView.createStaffElement(clef, pitchName, accidental, { width: 380, height: 135 });
    this.staffDisplay.appendChild(staffSvg);
    this.staffDisplayWrapper.style.display = 'flex';
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
    
    if (this.currentMode === 'EAR_TRAINING') {
      this.playAgainButton.textContent = 'Play Notes Again';
      this.playAgainButton.style.visibility =
        state === 'GUESSING' || (state === 'FEEDBACK' && !promptDivHasCorrectClass)
          ? 'visible'
          : 'hidden';
      const notesGenerated = this.noteSpans.length > 0;
      this.noteDisplay.style.visibility =
        notesGenerated && ['PLAYING', 'GUESSING', 'FEEDBACK'].includes(state)
          ? 'visible'
          : 'hidden';
      this.staffDisplayWrapper.style.display = 'none';
      this.rainbowToggleBtn.style.display = 'none';
    } else {
      this.playAgainButton.style.visibility = 'hidden';
      this.noteDisplay.style.display = 'none';
      this.staffDisplayWrapper.style.display = state === 'IDLE' ? 'none' : 'flex';
      this.rainbowToggleBtn.style.display = 'inline-flex';
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