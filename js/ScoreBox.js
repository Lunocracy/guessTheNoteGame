class ScoreBox {
  constructor(rootElement) {
    this.totalGuesses = 0;
    this.correctGuesses = 0;
    this.emojiHistory = [];
    this.detailedHistory = []; // { note, time, isCorrect }

    this.isTwoPlayer = false;
    this.p1Name = 'Player 1';
    this.p1Score = 0;
    this.p1History = [];
    this.p2Name = 'Player 2';
    this.p2Score = 0;
    this.p2History = [];

    this.div = makeElement('div', {
      style: {
        textAlign: 'center', padding: '0', background: '#1c1917', color: 'white',
        zIndex: '10', position: 'absolute', cursor: 'pointer',
        overflow: 'hidden', fontFamily: '"Architects Daughter", Arial, sans-serif', boxSizing: 'border-box',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
      }
    });
    if (rootElement) rootElement.appendChild(this.div);

    this.positioner = new SmartElementPositioner(this.div, {
      container: rootElement,
      position: [0, 0], size: [100, 6],
      sizeCallback: (self, pixelDims) => {
        const scoreFontSize = Math.max(13, pixelDims.height * 0.42);
        const emojiFontSize = Math.max(11, pixelDims.height * 0.35);
        const resetButtonSize = pixelDims.width * 0.055;

        this.scoreText.style.fontSize = `${scoreFontSize}px`;
        this.scoreText.style.lineHeight = `${pixelDims.height}px`;

        this.emojiLayer.style.fontSize = `${emojiFontSize}px`;
        this.emojiLayer.style.lineHeight = `${pixelDims.height}px`;
        this.emojiLayer.style.paddingRight = `${resetButtonSize + 10}px`;

        this.resetButton.style.width = `${resetButtonSize}px`;
        this.resetButton.style.height = `${resetButtonSize}px`;
        this.resetButton.style.fontSize = `${resetButtonSize * 0.55}px`;
        this.resetButton.style.lineHeight = `${resetButtonSize * 0.95}px`;
        const padding = Math.max(2, pixelDims.height * 0.1);
        this.resetButton.style.top = `${padding}px`;
        this.resetButton.style.right = `${padding}px`;

        this.updateDisplay();
      }
    });

    this.emojiLayer = makeElement('div', {
      className: 'emoji-background',
      style: {
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        zIndex: '1', opacity: '0.25', whiteSpace: 'nowrap', textAlign: 'left',
        overflow: 'hidden', userSelect: 'none', pointerEvents: 'none'
      }
    });
    this.div.appendChild(this.emojiLayer);

    this.scoreText = makeElement('div', {
      className: 'score-text', textContent: 'Score: 0 out of 0',
      style: {
        position: 'relative', zIndex: '2', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', textShadow: '1px 1px 2px black, -1px -1px 2px black',
        pointerEvents: 'none'
      }
    });
    this.div.appendChild(this.scoreText);

    this.resetButton = makeElement('button', {
      textContent: '🔄', title: 'Reset Score',
      className: 'score-reset-btn',
      style: {
        position: 'absolute', zIndex: '3', background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.4)', color: 'white', borderRadius: '50%',
        textAlign: 'center', cursor: 'pointer', padding: '0', boxShadow: '0 0 5px rgba(0,0,0,0.5)',
        fontFamily: 'Arial, sans-serif'
      }
    });
    this.resetButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.reset();
    });
    this.div.appendChild(this.resetButton);

    this.div.addEventListener('click', () => {
      this.showDetailedLogModal();
    });

    this.positioner.update();
  }

  recordGuess(isCorrect, meta = null) {
    this.totalGuesses++;
    const emoji = isCorrect ? '👍' : '👎';
    if (isCorrect) {
      this.correctGuesses++;
    }
    this.emojiHistory.push(emoji);
    if (meta) {
      this.detailedHistory.push({
        note: meta.note || '?',
        time: meta.time || '0.0',
        isCorrect: isCorrect
      });
    }
    this.updateDisplay();
  }

  reset() {
    this.isTwoPlayer = false;
    this.p1Name = 'Player 1';
    this.p1Score = 0;
    this.p1History = [];
    this.p2Name = 'Player 2';
    this.p2Score = 0;
    this.p2History = [];
    this.totalGuesses = 0;
    this.correctGuesses = 0;
    this.emojiHistory = [];
    this.detailedHistory = [];
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.isTwoPlayer) {
      const p1Total = this.p1History.length;
      const p2Total = this.p2History.length;
      this.scoreText.textContent = `${this.p1Name}: ${this.p1Score}/${p1Total}   vs   ${this.p2Name}: ${this.p2Score}/${p2Total}`;
      this.emojiLayer.textContent = `P1: ${this.p1History.join('')} | P2: ${this.p2History.join('')}`;
    } else {
      let speedText = '';
      if (this.detailedHistory.length > 0) {
        const sumTime = this.detailedHistory.reduce((acc, cur) => acc + parseFloat(cur.time || 0), 0);
        const avgTime = (sumTime / this.detailedHistory.length).toFixed(1);
        speedText = ` • ${avgTime}s avg`;
      }
      const pct = this.totalGuesses > 0 ? Math.round((this.correctGuesses / this.totalGuesses) * 100) : 100;
      this.scoreText.textContent = `Score: ${this.correctGuesses}/${this.totalGuesses} (${pct}%)${speedText}`;
      this.emojiLayer.textContent = this.emojiHistory.join('');
    }
  }

  setTwoPlayerScores(p1Name, p1Score, p1Total, p1History, p2Name, p2Score, p2Total, p2History) {
    this.isTwoPlayer = true;
    this.p1Name = p1Name;
    this.p1Score = p1Score;
    this.p1History = [...p1History];
    this.p2Name = p2Name;
    this.p2Score = p2Score;
    this.p2History = [...p2History];
    
    this.scoreText.textContent = `${p1Name}: ${p1Score}/${p1Total}   vs   ${p2Name}: ${p2Score}/${p2Total}`;
    this.emojiLayer.textContent = `P1: ${p1History.join('')} | P2: ${p2History.join('')}`;
  }

  showDetailedLogModal() {
    const existing = document.getElementById('score-log-modal');
    if (existing) existing.remove();

    const modal = makeElement('div', {
      id: 'score-log-modal',
      className: 'v-modal',
      style: { position: 'absolute', width: '70%', height: '70%', top: '15%', left: '15%', zIndex: '99999' }
    });

    const title = makeElement('h2', {
      textContent: 'Performance & History',
      style: { margin: '0 0 15px 0', textAlign: 'center', color: '#ffcc00', fontSize: '24px' }
    });
    modal.appendChild(title);

    const contentArea = makeElement('div', {
      style: { flexGrow: '1', overflowY: 'auto', display: 'flex', gap: '20px', width: '100%' }
    });

    if (this.detailedHistory.length > 0) {
      const col = makeElement('div', {
        style: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }
      });
      const pct = this.totalGuesses > 0 ? Math.round((this.correctGuesses / this.totalGuesses) * 100) : 100;
      col.appendChild(makeElement('h3', {
        textContent: `Sight-Reading Accuracy: ${this.correctGuesses}/${this.totalGuesses} (${pct}%)`,
        style: { margin: '0 0 15px 0', color: '#00f2fe', fontSize: '20px' }
      }));

      const grid = makeElement('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '15px', justifyContent: 'center' }
      });

      this.detailedHistory.forEach((item, index) => {
        const bg = item.isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
        const border = item.isCorrect ? '#22c55e' : '#ef4444';
        const card = makeElement('div', {
          style: {
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, [
          makeElement('strong', { textContent: `#${index + 1} ${item.note}` }),
          makeElement('span', { textContent: `(${item.time}s)`, style: { opacity: '0.75', fontSize: '12px' } }),
          makeElement('span', { textContent: item.isCorrect ? '👍' : '👎' })
        ]);
        grid.appendChild(card);
      });

      col.appendChild(grid);
      contentArea.appendChild(col);
    } else {
      const p1Col = makeElement('div', {
        style: { width: '50%', borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }
      });
      const p1TitleStr = this.isTwoPlayer 
        ? `${this.p1Name}: ${this.p1Score}/${this.p1History.length}` 
        : `Player 1: ${this.correctGuesses}/${this.totalGuesses}`;
      p1Col.appendChild(makeElement('h3', {
        textContent: p1TitleStr,
        style: { margin: '0 0 15px 0', color: '#66ccff', fontSize: '20px' }
      }));
      
      const p1HistoryContainer = makeElement('div', {
        style: { display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '18px', justifyContent: 'center' }
      });
      const p1List = this.isTwoPlayer ? this.p1History : this.emojiHistory;
      p1List.forEach((emoji, index) => {
        p1HistoryContainer.appendChild(makeElement('span', { 
          textContent: `R${index+1}:${emoji}`,
          style: { background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '4px' }
        }));
      });
      p1Col.appendChild(p1HistoryContainer);
      contentArea.appendChild(p1Col);

      if (this.isTwoPlayer) {
        const p2Col = makeElement('div', {
          style: { width: '50%', paddingLeft: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }
        });
        p2Col.appendChild(makeElement('h3', {
          textContent: `${this.p2Name}: ${this.p2Score}/${this.p2History.length}`,
          style: { margin: '0 0 15px 0', color: '#ff6666', fontSize: '20px' }
        }));
        
        const p2HistoryContainer = makeElement('div', {
          style: { display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '18px', justifyContent: 'center' }
        });
        this.p2History.forEach((emoji, index) => {
          p2HistoryContainer.appendChild(makeElement('span', { 
            textContent: `R${index+1}:${emoji}`,
            style: { background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '4px' }
          }));
        });
        p2Col.appendChild(p2HistoryContainer);
        contentArea.appendChild(p2Col);
      } else {
        const p2Col = makeElement('div', {
          textContent: 'Play 2-Player mode to see competitive history!',
          style: { width: '50%', paddingLeft: '10px', color: '#aaa', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }
        });
        contentArea.appendChild(p2Col);
      }
    }

    modal.appendChild(contentArea);

    const closeButton = makeElement('button', {
      textContent: 'Close',
      className: 'v-btn v-btn-danger',
      style: { marginTop: '15px' }
    });
    closeButton.onclick = (e) => {
      e.stopPropagation();
      modal.remove();
    };
    modal.appendChild(closeButton);

    this.div.parentElement.appendChild(modal);
  }
}

globalThis.ScoreBox = ScoreBox;
if (typeof module !== 'undefined' && module.exports) module.exports = ScoreBox;