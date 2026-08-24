class GuessTheNoteGame {
  constructor() {
    // Empty constructor to overwrite legacy
  }

  start(envParam) {
      if (envParam && envParam.container) {
        this.rootElement = envParam.container;
      }
      if (!this.rootElement) {
        this.rootElement = document.querySelector('.guess-the-note-wrapper') || document.body;
      }

      // Safeguard load font link directly into head to prevent rendering delay
      if (!document.getElementById('architects-daughter-font')) {
        const link = makeElement('link', {
          id: 'architects-daughter-font',
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap'
        });
        document.head.appendChild(link);
      }

      if (!this.pianoSettings) {
        this.pianoSettings = {};
      }
      if (!this.instruments) {
        this.instruments = new InstrumentSounds();
        window.instruments = this.instruments;
      }
      if (!this.States) {
        this.States = {
          IDLE: 'IDLE',
          PLAYING: 'PLAYING',
          GUESSING: 'GUESSING',
          FEEDBACK: 'FEEDBACK',
        };
      }
      if (!this.state) {
        this.state = this.States.IDLE;
      }
      if (!this.currentSequence) {
        this.currentSequence = [];
      }
      if (!this.overlays) {
        this.overlays = [];
      }
      if (!this.startDelay) {
        this.startDelay = 1000;
      }
      if (!this.correctFeedbackDelay) {
        this.correctFeedbackDelay = 3000;
      }
      if (!this.newRoundDelay) {
        this.newRoundDelay = 700;
      }
      if (!this.pianoRenderModes) {
        this.pianoRenderModes = ['fractions', 'midpoints', 'twelfths'];
        this.currentModeIndex = 0;
      }

      this.scoreBox = new ScoreBox(this.rootElement);
      this.scoreBox.start();

      this.gameBox = new GameBox();
      this.gameBox.start(this.rootElement);

      this.addEventListeners();

      this.pianoDivElement = makeElement('div', {
        style: { overflow: 'hidden', position: 'absolute' }, // MUST BE ABSOLUTE
      });
      this.rootElement.appendChild(this.pianoDivElement); // MUST APPEND FIRST

      this.pianoPositioner = new SmartElementPositioner(this.pianoDivElement, {
        container: this.rootElement, // BIND TO SANDBOX
        position: [0, 40],
        size: [100, 40],
        sizeCallback: (self, pixelDims) => {
          if (this.piano && pixelDims.width > 0 && pixelDims.height > 0) {
            this.piano.setSizeAndPosition(pixelDims.width, pixelDims.height);
          }
        },
      });

      this.piano = new Piano();
      this.pianoDivElement.appendChild(this.piano.getContainer());
      this.piano.setGameInstance(this);
      this.pianoPositioner.update();

      this.instrumentSelector = new InstrumentSelector(this);
      this.instrumentSelector.start();

      this.keySelector = new KeySignatureSelector(this);
      this.keySelector.start();

      this.createSecretButton();
      this.updateUI();
    }

  addEventListeners() {
      // Single-player path
      this.gameBox.getStartButton().addEventListener('click', async () => {
        if (window.instruments && typeof window.instruments.resumeContext === 'function') {
           await window.instruments.resumeContext();
        }
        this.isTwoPlayerMode = false;
        this.scoreBox.isTwoPlayer = false;
        this.scoreBox.reset();
        this.startNewRound();
      });

      // Two-player path
      if (this.gameBox.getStartTwoPlayerButton()) {
        this.gameBox.getStartTwoPlayerButton().addEventListener('click', async () => {
          if (window.instruments && typeof window.instruments.resumeContext === 'function') {
             await window.instruments.resumeContext();
          }
          this.showPlayerNameModal();
        });
      }
      
      this.gameBox.getPlayAgainButton().addEventListener('click', () => {
        if (
          this.state === this.States.GUESSING ||
          (this.state === this.States.FEEDBACK &&
            !this.gameBox.getPromptDiv().classList.contains('correct'))
        ) {
          this.playSequence();
        }
      });
    }

  updateUI() {
      this.gameBox.updateUI(this.state);
    }

  stopRound() {
      this.stopGuessTimer();
      this.overlays.forEach((overlay) =>
        this.piano.removeOverlayElement(overlay)
      );
      this.overlays = [];
      this.state = this.States.IDLE;
      this.currentSequence = [];
      this.gameBox.getPromptDiv().classList.remove('correct', 'incorrect');
      this.gameBox.setFeedbackText('');
      this.gameBox
        .getNoteSpans()
        .forEach((span) => (span.style.visibility = 'hidden'));
      this.gameBox.getPlayAgainButton().style.visibility = 'visible';
      const fullStartMidi = this.piano.settings.fullStartMidi;
      const fullEndMidi = this.piano.settings.fullEndMidi;
      for (let midi = fullStartMidi; midi <= fullEndMidi; midi++) {
        this.piano.glowPiano.setKeySemiActive(midi, false);
      }
      if (window.instruments) {
        window.instruments.stopAllNotes();
      }
      this.updateUI();
    }

  startNewRound() {
      if (this.state !== this.States.IDLE) return;

      this.overlays.forEach((overlay) =>
        this.piano.removeOverlayElement(overlay)
      );
      this.overlays = [];
      if (window.instruments) window.instruments.stopAllNotes();

      this.state = this.States.PLAYING;
      this.currentSequence = [];
      const fullStartMidi = this.piano.settings.fullStartMidi;
      const fullEndMidi = this.piano.settings.fullEndMidi;

      if (Math.random() < 0.2) {
        const newStartMidi =
          Math.floor(Math.random() * (fullEndMidi - 11 - fullStartMidi + 1)) +
          fullStartMidi;
        this.piano.setGameRange(newStartMidi, newStartMidi + 11);
      } else {
        this.piano.setGameRange(
          this.piano.gameRange.startMidi,
          this.piano.gameRange.endMidi
        );
      }

      const { startMidi, endMidi } = this.piano.gameRange;
      let availableNotes = this.keySelector.getAvailableNotes();
      if (availableNotes.length < 4) {
        availableNotes = Array.from(
          { length: endMidi - startMidi + 1 },
          (_, i) => startMidi + i
        );
      }

      // Dynamic sequence length distribution (50% length 3, 25% length 2, 25% length 4)
      let seqLength = 3;
      const r = Math.random();
      if (r < 0.25) {
        seqLength = 2;
      } else if (r < 0.50) {
        seqLength = 4;
      }

      this.currentSequence = [];
      while (this.currentSequence.length < seqLength) {
        const randomIndex = Math.floor(Math.random() * availableNotes.length);
        const selectedNote = availableNotes[randomIndex];
        if (!this.currentSequence.includes(selectedNote)) {
          this.currentSequence.push(selectedNote);
        }
      }
      this.currentSequence = this.currentSequence.filter(
        (midi) => midi >= startMidi && midi <= endMidi
      );

      for (
        let midi = this.piano.settings.fullStartMidi;
        midi <= this.piano.settings.fullEndMidi;
        midi++
      ) {
        this.piano.glowPiano.setKeySemiActive(midi, false);
      }

      // Randomly select which note is hidden
      this.hiddenIndex = Math.floor(Math.random() * seqLength);
      const ordinalNames = ['first', 'second', 'third', 'fourth'];
      const hiddenOrdinal = ordinalNames[this.hiddenIndex];

      this.gameBox.getPromptDiv().classList.remove('correct', 'incorrect');
      this.gameBox.displayNotes(this.currentSequence, this.hiddenIndex);
      this.gameBox.setFeedbackText(`guess the ${hiddenOrdinal} note`);
      this.updateUI();
      setTimeout(() => this.playSequence(), this.startDelay);
    }

  playSequence() {
      if (
        this.state !== this.States.PLAYING &&
        this.state !== this.States.GUESSING &&
        !(
          this.state === this.States.FEEDBACK &&
          !this.gameBox.getPromptDiv().classList.contains('correct')
        )
      ) {
        return;
      }

      if (this.state === this.States.PLAYING) {
        this.gameBox
          .getNoteSpans()
          .forEach((span) => (span.style.visibility = 'hidden'));
      }

      const playNoteWithDelay = (index) => {
        if (index >= this.currentSequence.length) {
          if (this.state === this.States.PLAYING) {
            this.state = this.States.GUESSING;
            this.updateUI();
            if (this.isTwoPlayerMode) {
              this.startGuessTimer();
            }
          }
          return;
        }
        const midiCode = this.currentSequence[index];
        const span = this.gameBox.getNoteSpans()[index];
        const visualDuration = 1000;
        const suppressDisplay = index === this.hiddenIndex;

        if (index !== this.hiddenIndex) {
          let numberElement = this.overlays.find(
            (el) =>
              el.dataset.sequenceIndex === `${index + 1}` &&
              el.dataset.midi === `${midiCode}`
          );
          if (!numberElement) {
            numberElement = document.createElement('div');
            numberElement.textContent = `${index + 1}`;
            numberElement.dataset.sequenceIndex = `${index + 1}`;
            numberElement.dataset.midi = `${midiCode}`;
            const keyInfo = this.piano.graphicPiano.getKeyByMidi(midiCode);
            const isBlack = keyInfo?.bbox.isBlack ?? false;
            numberElement.style.color = isBlack ? 'white' : 'black';
            numberElement.style.fontSize = '48px';
            numberElement.style.textShadow = isBlack
              ? '2px 2px 0 black'
              : '-2px -2px 0 white';
            numberElement.style.display = 'none';
            numberElement.style.textAlign = 'center';
            this.piano.addOverlayElement(midiCode, numberElement, {
              bottomOffset: 5,
            });
            this.overlays.push(numberElement);
          }
          setTimeout(() => {
            numberElement.style.display = 'block';
            numberElement.classList.add('pulse-overlay');
            setTimeout(() => {
              if (numberElement.parentNode)
                numberElement.classList.remove('pulse-overlay');
            }, 500);
          }, 10);
          this.piano.glowPiano.setKeySemiActive(midiCode, true);
        } else {
          this.piano.glowPiano.setKeySemiActive(midiCode, false);
        }

        this.piano.glowPiano.playNote(midiCode, visualDuration, suppressDisplay, {
          sequenceIndex: index,
        });

        if (span) {
          span.style.visibility = 'visible';
          span.classList.add('pulse');
          setTimeout(() => span.classList.remove('pulse'), 500);
        }

        setTimeout(() => playNoteWithDelay(index + 1), visualDuration + 50);
      };

      window.instruments.stopAllNotes();
      playNoteWithDelay(0);
    }

  handleNoteEvent(midi, eventType, customData) {
      if (eventType === 'start') {
        if (window.instruments && window.instruments.isRandomInstrument) {
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
          let nextInst = available[Math.floor(Math.random() * available.length)];
          if (window.instruments.lastRandomInstrument === nextInst) {
            const filtered = available.filter(inst => inst !== nextInst);
            nextInst = filtered[Math.floor(Math.random() * filtered.length)];
          }
          window.instruments.lastRandomInstrument = nextInst;
          window.instruments.setActiveInstrument(nextInst);
        }
        window.instruments.noteOn(midi);
      } else if (eventType === 'stop') {
        window.instruments.noteOff(midi);
      }

      if (customData?.sequenceIndex !== undefined) return;
      if (this.state === this.States.PLAYING) return;
      if (
        this.state !== this.States.GUESSING &&
        !(
          this.state === this.States.FEEDBACK &&
          !this.gameBox.getPromptDiv().classList.contains('correct')
        )
      )
        return;

      if (eventType === 'start') {
        const sequenceIndex = this.currentSequence.indexOf(midi);
        if (sequenceIndex !== -1 && sequenceIndex !== this.hiddenIndex) {
          const span = this.gameBox.getNoteSpans()[sequenceIndex];
          if (span) {
            span.classList.add('pulse');
            setTimeout(() => span.classList.remove('pulse'), 500);
          }
          return;
        }

        this.stopGuessTimer();
        this.state = this.States.FEEDBACK;
        const isCorrect = midi === this.currentSequence[this.hiddenIndex];
        
        if (this.isTwoPlayerMode) {
          this.recordPlayerGuess(isCorrect);
        } else {
          this.scoreBox.recordGuess(isCorrect);
        }
        
        this.displayFeedback(midi, isCorrect);
      }
    }

  displayFeedback(guessedMidi, isCorrect) {
      let displayNote = 'Time out';
      if (guessedMidi !== null) {
        const guessedNote = GameBox.midiToNote(guessedMidi);
        const [baseNote, modifier] = PianoUtils.parseNote(guessedNote);
        displayNote = modifier
          ? `${baseNote.toLowerCase()}♯`
          : baseNote.toLowerCase();
      }

      const promptDiv = this.gameBox.getPromptDiv();
      promptDiv.classList.remove('pulse-green', 'pulse-red');

      if (isCorrect) {
        promptDiv.classList.add('pulse-green');
        this.gameBox.updateNoteDisplay(this.hiddenIndex, guessedMidi, true);
        const targetSpan = this.gameBox.getNoteSpans()[this.hiddenIndex];
        if (targetSpan) {
          targetSpan.style.visibility = 'visible';
          targetSpan.classList.add('pulse');
          setTimeout(() => targetSpan.classList.remove('pulse'), 500);
        }
        this.gameBox.setFeedbackText('good job!');
        promptDiv.classList.add('correct');
        this.gameBox.getPlayAgainButton().style.visibility = 'hidden';

        const numberOverlay = document.createElement('div');
        numberOverlay.textContent = `${this.hiddenIndex + 1}`;
        numberOverlay.dataset.midi = `${guessedMidi}`;
        const keyInfo = this.piano.graphicPiano.getKeyByMidi(guessedMidi);
        const isBlack = keyInfo?.bbox.isBlack ?? false;
        numberOverlay.style.color = isBlack ? 'white' : 'black';
        numberOverlay.style.fontSize = '48px';
        numberOverlay.style.textShadow = isBlack
          ? '2px 2px 0 black'
          : '-2px -2px 0 white';
        numberOverlay.style.display = 'none';
        this.piano.addOverlayElement(guessedMidi, numberOverlay, { bottomOffset: 5 });
        this.overlays.push(numberOverlay);

        setTimeout(() => {
          numberOverlay.style.display = 'block';
          numberOverlay.classList.add('pulse-overlay');
          setTimeout(() => {
            if (numberOverlay.parentNode) numberOverlay.classList.remove('pulse-overlay');
          }, 500);
        }, 10);
        this.piano.glowPiano.setKeySemiActive(guessedMidi, true);

        setTimeout(() => {
          promptDiv.classList.remove('pulse-green', 'correct');
          this.state = this.States.IDLE;
          this.overlays.forEach((overlay) =>
            this.piano.removeOverlayElement(overlay)
          );
          this.overlays = [];
          this.currentSequence.forEach((midi) => {
            if (midi) this.piano.glowPiano.setKeySemiActive(midi, false);
          });

          if (this.isTwoPlayerMode) {
            this.advanceTwoPlayerTurn();
          } else {
            if (Math.random() < 0.8) {
              const fullStartMidi = this.piano.settings.fullStartMidi;
              const maxStartMidi = this.piano.settings.fullEndMidi - 11;
              const newStartMidi =
                Math.floor(Math.random() * (maxStartMidi - fullStartMidi + 1)) +
                fullStartMidi;
              this.piano.setGameRange(newStartMidi, newStartMidi + 11);
            }
            setTimeout(() => this.startNewRound(), this.newRoundDelay);
          }
        }, this.correctFeedbackDelay);
      } else {
        promptDiv.classList.add('pulse-red');
        this.gameBox.setFeedbackText(`${displayNote} is incorrect`);
        promptDiv.classList.add('incorrect');
        this.gameBox.getPlayAgainButton().style.visibility = 'visible';

        const noSymbolSVG = makeElement(
          'svg:svg',
          { width: 50, height: 50, viewBox: '0 0 100 100' },
          [
            makeElement('svg:circle', {
              cx: 50,
              cy: 50,
              r: 40,
              fill: 'none',
              stroke: '#ff6666',
              'stroke-width': 15,
            }),
            makeElement('svg:line', {
              x1: 20,
              y1: 80,
              x2: 80,
              y2: 20,
              stroke: '#ff6666',
              'stroke-width': 15,
            }),
          ]
        );
        noSymbolSVG.style.display = 'none';
        if (guessedMidi !== null) {
          this.piano.addOverlayElement(guessedMidi, noSymbolSVG, {
            bottomOffset: 5,
          });
          this.overlays.push(noSymbolSVG);
          setTimeout(() => (noSymbolSVG.style.display = 'block'), 10);
        }

        setTimeout(() => {
          if (guessedMidi !== null) {
            this.piano.removeOverlayElement(noSymbolSVG);
            this.overlays = this.overlays.filter((o) => o !== noSymbolSVG);
          }
          if (this.state === this.States.FEEDBACK) {
            promptDiv.classList.remove('pulse-red', 'incorrect');
            if (this.isTwoPlayerMode) {
              this.advanceTwoPlayerTurn();
            } else {
              const ordinalNames = ['first', 'second', 'third', 'fourth'];
              const hiddenOrdinal = ordinalNames[this.hiddenIndex];
              this.gameBox.setFeedbackText(`guess the ${hiddenOrdinal} note`);
              this.state = this.States.GUESSING;
              this.updateUI();
            }
          }
        }, 1000);
      }
    }

  setGameRange(startMidi, endMidi) {
      this.piano.setGameRange(startMidi, endMidi);
    }

  resizePiano(widthPercent, heightPercent) {
      if (!this.pianoDivElement) return;
      this.pianoDivElement.setPercentDimensions(
        0,
        40,
        widthPercent,
        heightPercent
      );
      const dims = this.pianoDivElement.getPixelDimensions();
      this.piano.setPianoSize(dims.width, dims.height);
    }

  createSecretButton() {
      const secretButton = makeElement('div', {
        title: 'Cycle Piano Render Mode',
        style: {
          position: 'absolute', // MUST BE ABSOLUTE
          top: '1vh',
          right: '1vw',
          width: '2vw',
          height: '2vw',
          zIndex: '1001',
          cursor: 'pointer',
          opacity: '0.05',
          transition: 'opacity 0.2s ease-in-out',
        },
      });

      secretButton.addEventListener('mouseenter', () => (secretButton.style.opacity = '0.2'));
      secretButton.addEventListener('mouseleave', () => (secretButton.style.opacity = '0.05'));

      secretButton.addEventListener('click', () => {
        this.currentModeIndex = (this.currentModeIndex + 1) % this.pianoRenderModes.length;
        const newMode = this.pianoRenderModes[this.currentModeIndex];
        if (this.piano && this.piano.graphicPiano) {
          this.piano.graphicPiano.setGeometryMode(newMode);
        }
      });

      this.rootElement.appendChild(secretButton); // MUST APPEND TO CONTAINER
    }

  async run(env) {
      if (this.rootElement) this.destroy();
      this.env = env;
      this.rootElement = env.container;

      if (this.rootElement === document.body) {
        document.documentElement.style.height = '100%';
        document.documentElement.style.margin = '0';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
      }

      this.rootElement.classList.add('guess-the-note-wrapper');
      this.injectStyles();

      this.pianoSettings = {};
      this.instruments = new InstrumentSounds();
      window.instruments = this.instruments;

      this.States = {
        IDLE: 'IDLE',
        PLAYING: 'PLAYING',
        GUESSING: 'GUESSING',
        FEEDBACK: 'FEEDBACK',
      };
      this.state = this.States.IDLE;
      this.currentSequence = [];
      this.hiddenIndex = 2;
      this.overlays = [];
      this.startDelay = 1000;
      this.correctFeedbackDelay = 3000;
      this.newRoundDelay = 700;

      this.guessTimerInterval = null;
      this.isTwoPlayerMode = false;

      this.pianoRenderModes = ['fractions', 'midpoints', 'twelfths'];
      this.currentModeIndex = 0;

      this.start();

      this.resizeObserver = new ResizeObserver(() => {
        if (this.scoreBox && this.scoreBox.positioner) this.scoreBox.positioner.update();
        if (this.gameBox && this.gameBox.positioner) this.gameBox.positioner.update();
        if (this.pianoPositioner) this.pianoPositioner.update();
        if (this.instrumentSelector && this.instrumentSelector.positioner) {
           this.instrumentSelector.positioner.update();
           this.instrumentSelector.popupPositioner.update();
        }
        if (this.keySelector && this.keySelector.buttonPositioner) {
           this.keySelector.buttonPositioner.update();
           this.keySelector.popupPositioner.update();
        }
      });
      this.resizeObserver.observe(this.rootElement);
    }

  destroy() {
      this.stopGuessTimer();
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      if (this.rootElement) {
        this.rootElement.innerHTML = '';
      }
      if (window.instruments) {
        window.instruments.stopAllNotes();
      }
    }

  injectStyles() {
      applyCss(`
        /* Unified Game Modals & Overlays */
        .v-modal {
          position: absolute;
          background: rgba(18, 18, 28, 0.96) !important;
          backdrop-filter: blur(14px) !important;
          -webkit-backdrop-filter: blur(14px) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          border-radius: 16px !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7) !important;
          color: white !important;
          padding: 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          font-family: 'Architects Daughter', Arial, sans-serif !important;
          animation: modalFadeIn 0.2s ease-out;
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Unified Tactile Game Buttons */
        .v-btn {
          font-family: 'Architects Daughter', Arial, sans-serif !important;
          font-size: 18px;
          padding: 10px 24px;
          background: rgba(255, 255, 255, 0.08);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          outline: none;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
        .v-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
        .v-btn:active {
          transform: translateY(0);
        }
        
        .v-btn-primary {
          background: #007acc;
          border-color: #009cf7;
        }
        .v-btn-primary:hover {
          background: #0094f7;
          box-shadow: 0 0 15px rgba(0, 156, 247, 0.4);
        }
        
        .v-btn-success {
          background: #2e7d32;
          border-color: #4caf50;
        }
        .v-btn-success:hover {
          background: #388e3c;
          box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
        }

        .v-btn-danger {
          background: #c62828;
          border-color: #e53935;
        }
        .v-btn-danger:hover {
          background: #d32f2f;
          box-shadow: 0 0 15px rgba(229, 57, 53, 0.4);
        }

        /* Beautiful Responsive Input Fields */
        .v-input {
          font-family: 'Architects Daughter', Arial, sans-serif !important;
          font-size: 18px;
          padding: 12px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          background: rgba(0, 0, 0, 0.4);
          color: white;
          border-radius: 8px;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s ease;
          outline: none;
        }
        .v-input:focus {
          border-color: #ffcc00;
          box-shadow: 0 0 10px rgba(255, 204, 0, 0.3);
          background: rgba(0, 0, 0, 0.6);
        }

        .guess-the-note-wrapper {
          background-color: #a0a0a0;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
          transition: background-color 0.5s ease-in-out;
        }
        .guess-the-note-wrapper svg.piano-svg {
          display: block;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0; 
        }
        .guess-the-note-wrapper .prompt-div {
          text-align: center;
          padding: 1vh;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          z-index: 10;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Architects Daughter', Arial, sans-serif !important;
        }
        .guess-the-note-wrapper .prompt-div * {
          font-family: 'Architects Daughter', Arial, sans-serif !important;
        }
        .guess-the-note-wrapper .white-key, .guess-the-note-wrapper .black-key {
          transition: fill 0.2s ease, stroke 0.2s ease;
          pointer-events: all;
        }
        .guess-the-note-wrapper .white-key-base, .guess-the-note-wrapper .black-key-left-rect, .guess-the-note-wrapper .black-key-right-rect {
          pointer-events: all;
        }
        .guess-the-note-wrapper .pulse { animation: pulse 0.5s ease-out; }
        @keyframes pulse { 0% { transform: scale(1); } 20% { transform: scale(1.6); } 100% { transform: scale(1); } }
        .guess-the-note-wrapper .feedbackText { margin: 0.5vh; font-size: 24px; color: #fff; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); }
        .guess-the-note-wrapper .noteDisplay { display: flex; justify-content: center; gap: 20px; margin: 0.5vh; }
        .guess-the-note-wrapper .noteDisplay span { width: 100px; text-align: center; visibility: hidden; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); display: inline-block; white-space: nowrap; }
        
        /* Modern Startup Button Skins */
        .guess-the-note-wrapper #startButton {
          font-family: 'Architects Daughter', Arial, sans-serif !important;
          background: #007acc !important;
          border: 2px solid #009cf7 !important;
          border-radius: 12px !important;
          color: #fff !important;
          font-weight: bold !important;
          cursor: pointer;
          transition: all 0.2s ease !important;
          outline: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
        }
        .guess-the-note-wrapper #startButton:hover {
          background: #0094f7 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 12px rgba(0, 156, 247, 0.4) !important;
        }

        .guess-the-note-wrapper #startTwoPlayerButton {
          font-family: 'Architects Daughter', Arial, sans-serif !important;
          background: #2e7d32 !important;
          border: 2px solid #4caf50 !important;
          border-radius: 12px !important;
          color: #fff !important;
          font-weight: bold !important;
          cursor: pointer;
          transition: all 0.2s ease !important;
          outline: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
        }
        .guess-the-note-wrapper #startTwoPlayerButton:hover {
          background: #388e3c !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4) !important;
        }

        .guess-the-note-wrapper #playAgainButton {
          font-family: 'Architects Daughter', Arial, sans-serif !important;
          background: rgba(255, 255, 255, 0.12) !important;
          border: 2px solid rgba(255, 255, 255, 0.25) !important;
          border-radius: 12px !important;
          color: #fff !important;
          cursor: pointer;
          transition: all 0.2s ease !important;
          outline: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
        }
        .guess-the-note-wrapper #playAgainButton:hover {
          background: rgba(255, 255, 255, 0.22) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          transform: translateY(-1px) !important;
        }

        /* Keyboard & Selector Toggle Button Glows */
        .guess-the-note-wrapper #keySelectorButton {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important;
        }
        .guess-the-note-wrapper #keySelectorButton:hover {
          transform: scale(1.1) translateY(-2px) !important;
          box-shadow: 0 6px 12px rgba(0,0,0,0.5) !important;
        }

        .guess-the-note-wrapper .instrument-select-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease !important;
        }
        .guess-the-note-wrapper .instrument-select-btn:hover {
          transform: scale(1.1) translateY(-2px) !important;
          box-shadow: 0 6px 12px rgba(0,0,0,0.5) !important;
        }

        /* Scorebox Reset Transition */
        .guess-the-note-wrapper .score-reset-btn {
          transition: transform 0.2s ease, background 0.2s ease !important;
        }
        .guess-the-note-wrapper .score-reset-btn:hover {
          transform: scale(1.1) rotate(45deg) !important;
          background: rgba(255, 255, 255, 0.35) !important;
        }

        /* Tactile Depress effect on all active button clicks */
        .guess-the-note-wrapper #startButton:active,
        .guess-the-note-wrapper #startTwoPlayerButton:active,
        .guess-the-note-wrapper #playAgainButton:active,
        .guess-the-note-wrapper #keySelectorButton:active,
        .guess-the-note-wrapper .instrument-select-btn:active,
        .guess-the-note-wrapper .score-reset-btn:active,
        .guess-the-note-wrapper .v-btn:active {
          transform: scale(0.97) !important;
        }
        
        .guess-the-note-wrapper .instrument-display { width: 100%; height: 100%; background-image: url('resources/instruments.png'); background-size: 300% 300%; background-position: 0 0; transition: transform 0.2s ease; }
        .guess-the-note-wrapper .instrument-display:hover { transform: scale(1.1); }
        .guess-the-note-wrapper .instrument-popup { background-color: rgba(0, 0, 0, 0.95); border: 4px solid black; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); z-index: 100; display: none; }
        @keyframes pulseHighlight { 0% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); opacity: 0.5; } }
        @keyframes pulseGreenPrompt { 0% { background-color: rgba(0, 0, 0, 0.7); } 6% { background-color: rgba(33, 190, 33, 0.9); } 100% { background-color: rgba(0, 0, 0, 0.7); } }
        @keyframes pulseRedPrompt { 0% { background-color: rgba(0, 0, 0, 0.7); } 20% { background-color: rgba(150, 33, 33, 0.9); } 100% { background-color: rgba(0, 0, 0, 0.7); } }
        .guess-the-note-wrapper .game-box.pulse-green { animation: pulseGreenPrompt 2.8s ease-out 1 !important; }
        .guess-the-note-wrapper .game-box.pulse-red { animation: pulseRedPrompt 0.8s ease-out 1 !important; }
        @keyframes pulseOverlay { 0% { transform: scale(1) translateX(-50%); opacity: 1; } 50% { transform: scale(1.6) translateX(-50%); opacity: 0.8; } 100% { transform: scale(1) translateX(-50%); opacity: 1; } }
        .guess-the-note-wrapper .pulse-overlay { animation: pulseOverlay 0.5s ease-out; transform-origin: center center; }
      `, 'guess-the-note-styles');
    }


  showPlayerNameModal() {
      const modal = makeElement('div', {
        id: 'name-entry-modal',
        className: 'v-modal',
        style: { position: 'absolute', width: '60%', height: '60%', top: '20%', left: '20%', zIndex: '99999' }
      });

      const title = makeElement('h2', {
        textContent: 'Player Names',
        style: { color: '#ffcc00', margin: '0 0 20px 0', fontSize: '28px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }
      });
      modal.appendChild(title);

      const inputsContainer = makeElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '15px', width: '80%', maxWidth: '280px' }
      });

      const p1Wrapper = makeElement('div');
      p1Wrapper.appendChild(makeElement('div', { textContent: 'Player 1 Name:', style: { color: '#66ccff', marginBottom: '5px', fontSize: '18px' } }));
      const p1Input = makeElement('input', { type: 'text', value: this.p1Name || 'Player 1', className: 'v-input' });
      p1Wrapper.appendChild(p1Input);
      inputsContainer.appendChild(p1Wrapper);

      const p2Wrapper = makeElement('div');
      p2Wrapper.appendChild(makeElement('div', { textContent: 'Player 2 Name:', style: { color: '#ff6666', marginBottom: '5px', fontSize: '18px' } }));
      const p2Input = makeElement('input', { type: 'text', value: this.p2Name || 'Player 2', className: 'v-input' });
      p2Wrapper.appendChild(p2Input);
      inputsContainer.appendChild(p2Wrapper);

      modal.appendChild(inputsContainer);

      const actions = makeElement('div', { style: { display: 'flex', gap: '15px', marginTop: '20px' } });

      const cancelButton = makeElement('button', { textContent: 'Cancel', className: 'v-btn v-btn-danger' });
      cancelButton.onclick = () => modal.remove();
      actions.appendChild(cancelButton);

      const submitButton = makeElement('button', { textContent: 'Start Match!', className: 'v-btn v-btn-success' });
      submitButton.onclick = () => {
        this.p1Name = p1Input.value.trim() || 'Player 1';
        this.p2Name = p2Input.value.trim() || 'Player 2';
        modal.remove();
        this.initializeTwoPlayerMatch();
      };
      actions.appendChild(submitButton);

      modal.appendChild(actions);
      this.rootElement.appendChild(modal);
    }

  initializeTwoPlayerMatch() {
      this.isTwoPlayerMode = true;
      this.p1Score = 0;
      this.p2Score = 0;
      this.p1History = [];
      this.p2History = [];
      
      this.scoreBox.isTwoPlayer = true;
      this.scoreBox.p1Name = this.p1Name;
      this.scoreBox.p2Name = this.p2Name;
      this.scoreBox.setTwoPlayerScores(this.p1Name, 0, 0, [], this.p2Name, 0, 0, []);

      // Pre-generate 10 consistent, fair rounds that both players will face
      this.twoPlayerRounds = [];
      const { startMidi, endMidi } = this.piano.gameRange;
      let availableNotes = this.keySelector.getAvailableNotes();
      if (availableNotes.length < 4) {
        availableNotes = Array.from(
          { length: endMidi - startMidi + 1 },
          (_, i) => startMidi + i
        );
      }

      for (let rIndex = 0; rIndex < 10; rIndex++) {
        let seqLength = 3;
        const randVal = Math.random();
        if (randVal < 0.25) {
          seqLength = 2;
        } else if (randVal < 0.50) {
          seqLength = 4;
        }

        const currentSequence = [];
        while (currentSequence.length < seqLength) {
          const randomIndex = Math.floor(Math.random() * availableNotes.length);
          const selectedNote = availableNotes[randomIndex];
          if (!currentSequence.includes(selectedNote)) {
            currentSequence.push(selectedNote);
          }
        }
        const finalSequence = currentSequence.filter(
          (midi) => midi >= startMidi && midi <= endMidi
        );
        const hiddenIndex = Math.floor(Math.random() * seqLength);

        this.twoPlayerRounds.push({
          sequence: finalSequence,
          hiddenIndex: hiddenIndex
        });
      }

      this.currentPlayer = 1;
      this.currentStep = 0;
      this.currentSubRound = 0;
      
      this.showIntermissionOverlay(false);
    }

  showIntermissionOverlay(isTransition = false) {
      this.stopGuessTimer();
      const existing = document.getElementById('turn-intermission-overlay');
      if (existing) existing.remove();

      const activePlayerName = this.currentPlayer === 1 ? this.p1Name : this.p2Name;

      const overlay = makeElement('div', {
        id: 'turn-intermission-overlay',
        className: 'v-modal',
        style: { position: 'absolute', width: '60%', height: '50%', top: '25%', left: '20%', zIndex: '99999' }
      });

      const headingText = isTransition
        ? `Pass the device to ${activePlayerName}!`
        : `${activePlayerName}'s Turn!`;

      const colorValue = this.currentPlayer === 1 ? '#66ccff' : '#ff6666';
      const heading = makeElement('h2', {
        textContent: headingText,
        style: { color: colorValue, margin: '0 0 15px 0', fontSize: '32px', textShadow: `0 0 10px ${colorValue}50` }
      });
      overlay.appendChild(heading);

      const subText = makeElement('p', {
        textContent: `You are playing round ${this.currentSubRound + 1} of 2 for this turn.`,
        style: { fontSize: '18px', margin: '0 0 25px 0', color: '#cccccc' }
      });
      overlay.appendChild(subText);

      const startTurnBtn = makeElement('button', {
        textContent: `I am ${activePlayerName} - Start Turn`,
        className: `v-btn ${this.currentPlayer === 1 ? 'v-btn-primary' : 'v-btn-danger'}`,
        style: { fontSize: '20px', padding: '12px 30px' }
      });
      startTurnBtn.onclick = () => {
        overlay.remove();
        this.startTwoPlayerRound();
      };
      overlay.appendChild(startTurnBtn);

      this.rootElement.appendChild(overlay);
    }

  startTwoPlayerRound() {
      const roundIndex = this.currentStep * 2 + this.currentSubRound;
      const roundParams = this.twoPlayerRounds[roundIndex];
      this.currentSequence = roundParams.sequence;
      this.hiddenIndex = roundParams.hiddenIndex;

      this.state = this.States.PLAYING;
      this.gameBox.getPromptDiv().classList.remove('correct', 'incorrect');
      this.gameBox.displayNotes(this.currentSequence, this.hiddenIndex);

      const ordinalNames = ['first', 'second', 'third', 'fourth'];
      const hiddenOrdinal = ordinalNames[this.hiddenIndex];
      this.gameBox.setFeedbackText(`guess the ${hiddenOrdinal} note`);
      this.updateUI();
      setTimeout(() => this.playSequence(), this.startDelay);
    }

  startGuessTimer() {
      this.stopGuessTimer();
      this.guessTimeRemaining = 15;
      this.updateTimerDisplay();
      this.guessTimerInterval = setInterval(() => {
        this.guessTimeRemaining--;
        this.updateTimerDisplay();
        if (this.guessTimeRemaining <= 0) {
          this.stopGuessTimer();
          this.handleTimeout();
        }
      }, 1000);
    }

  stopGuessTimer() {
      if (this.guessTimerInterval) {
        clearInterval(this.guessTimerInterval);
        this.guessTimerInterval = null;
      }
    }

  updateTimerDisplay() {
      const ordinalNames = ['first', 'second', 'third', 'fourth'];
      const hiddenOrdinal = ordinalNames[this.hiddenIndex];
      const activePlayerName = this.currentPlayer === 1 ? this.p1Name : this.p2Name;
      
      const isLowTime = this.guessTimeRemaining <= 5;
      const timerColorTag = isLowTime ? '#ff3333' : '#ffcc00';
      const timerPulseClass = isLowTime ? ' pulse' : '';
      
      this.gameBox.setFeedbackText(`[⏰ ${this.guessTimeRemaining}s] ${activePlayerName}: Guess the ${hiddenOrdinal} note!`);
      this.gameBox.feedbackText.style.color = timerColorTag;
      
      if (isLowTime) {
        this.gameBox.feedbackText.classList.add('pulse');
        setTimeout(() => this.gameBox.feedbackText.classList.remove('pulse'), 300);
      } else {
        this.gameBox.feedbackText.style.color = 'white';
      }
    }

  handleTimeout() {
      this.state = this.States.FEEDBACK;
      this.recordPlayerGuess(false);
      this.displayFeedback(null, false);
    }

  recordPlayerGuess(isCorrect) {
      if (this.currentPlayer === 1) {
        this.p1History.push(isCorrect ? '👍' : '👎');
        if (isCorrect) this.p1Score++;
      } else {
        this.p2History.push(isCorrect ? '👍' : '👎');
        if (isCorrect) this.p2Score++;
      }
      this.scoreBox.setTwoPlayerScores(
        this.p1Name, this.p1Score, this.p1History.length, this.p1History,
        this.p2Name, this.p2Score, this.p2History.length, this.p2History
      );
    }

  advanceTwoPlayerTurn() {
      this.stopGuessTimer();
      this.currentSubRound++;

      if (this.currentSubRound < 2) {
        this.showIntermissionOverlay(false);
      } else {
        if (this.currentPlayer === 1) {
          this.currentPlayer = 2;
          this.currentSubRound = 0;
          this.showIntermissionOverlay(true);
        } else {
          this.currentPlayer = 1;
          this.currentSubRound = 0;
          this.currentStep++;

          if (this.currentStep < 5) {
            this.showIntermissionOverlay(true);
          } else {
            this.showMatchFinishedModal();
          }
        }
      }
    }

  showMatchFinishedModal() {
      const modal = makeElement('div', {
        id: 'match-finished-modal',
        className: 'v-modal',
        style: { position: 'absolute', width: '70%', height: '70%', top: '15%', left: '15%', zIndex: '99999' }
      });

      const celebration = makeElement('h1', {
        textContent: '🏆 Match Finished! 🏆',
        style: { color: '#ffcc00', margin: '0 0 15px 0', fontSize: '36px', textShadow: '0 0 12px rgba(255,204,0,0.4)' }
      });
      modal.appendChild(celebration);

      let winnerText = '';
      let color = '#fff';
      if (this.p1Score > this.p2Score) {
        winnerText = `${this.p1Name} Wins the Match!`;
        color = '#66ccff';
      } else if (this.p2Score > this.p1Score) {
        winnerText = `${this.p2Name} Wins the Match!`;
        color = '#ff6666';
      } else {
        winnerText = "It's a Tie Match!";
        color = '#a3a3c2';
      }

      const resultHeading = makeElement('h2', {
        textContent: winnerText,
        style: { color: color, margin: '0 0 20px 0', fontSize: '30px' }
      });
      modal.appendChild(resultHeading);

      const scores = makeElement('p', {
        textContent: `${this.p1Name}: ${this.p1Score} / 10\n${this.p2Name}: ${this.p2Score} / 10`,
        style: { fontSize: '24px', whiteSpace: 'pre', margin: '0 0 25px 0', lineHeight: '1.5', color: '#eeeeee' }
      });
      modal.appendChild(scores);

      const restartBtn = makeElement('button', {
        textContent: 'Play Again',
        className: 'v-btn v-btn-success',
        style: { fontSize: '20px' }
      });
      restartBtn.onclick = () => {
        modal.remove();
        this.isTwoPlayerMode = false;
        this.scoreBox.isTwoPlayer = false;
        this.scoreBox.reset();
        this.state = this.States.IDLE;
        this.updateUI();
      };
      modal.appendChild(restartBtn);

      this.rootElement.appendChild(modal);
    }
}