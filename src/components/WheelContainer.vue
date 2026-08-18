<script>
import { Winwheel } from 'vue-winwheel/Winwheel.js';

// Le canvas est dessiné en double résolution puis réduit en CSS : la roue
// reste nette sur les écrans haute densité.
const CANVAS_SIZE = 760;

// Palette « Ghibli » : prairie, crème, ciel, couchant.
const PALETTE = [
  { fill: '#4c8c7b', text: '#fffaf0' },
  { fill: '#f3e4c3', text: '#37605a' },
  { fill: '#7fb3d5', text: '#123449' },
  { fill: '#efb08c', text: '#6b3520' },
  { fill: '#a8c686', text: '#2d4522' },
  { fill: '#5d7fa3', text: '#f4f8fb' }
];

export default {
  name: 'WheelContainer',
  props: {
    movies: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      canvasSize: CANVAS_SIZE,
      wheel: null,
      spinning: false,
      winner: null
    };
  },
  computed: {
    segments() {
      const total = this.movies.length;
      return this.movies.map((movie, index) => {
        const color = PALETTE[this.colorIndexFor(index, total)];
        // Sur la moitié gauche de la roue, le texte doit être retourné pour
        // rester lisible dans le bon sens.
        const middleAngle = (index + 0.5) * (360 / total);
        return {
          text: this.wrapTitle(movie.title),
          fillStyle: color.fill,
          textFillStyle: color.text,
          strokeStyle: '#fffaf0',
          lineWidth: 3,
          textFontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
          textFontWeight: '700',
          textFontSize: this.fontSizeFor(total),
          textAlignment: 'outer',
          textDirection: middleAngle > 180 ? 'reversed' : 'normal',
          textMargin: 26
        };
      });
    }
  },
  watch: {
    segments: {
      handler() {
        this.$nextTick(this.buildWheel);
      },
      deep: true
    }
  },
  methods: {
    // Deux couleurs identiques ne doivent pas se toucher une fois le tour bouclé.
    colorIndexFor(index, total) {
      const base = index % PALETTE.length;
      if (index === total - 1 && total > 1 && base === 0) {
        return PALETTE.length - 1;
      }
      return base;
    },
    fontSizeFor(total) {
      if (total <= 6) return 30;
      if (total <= 10) return 26;
      if (total <= 14) return 24;
      return 22;
    },
    // Coupe un titre trop long en deux lignes (Winwheel gère le saut de ligne).
    wrapTitle(title) {
      const maxChars = 22;
      if (title.length <= maxChars) return title;

      const lines = [''];
      title.split(' ').forEach(word => {
        const current = lines[lines.length - 1];
        if (!current) {
          lines[lines.length - 1] = word;
        } else if (current.length + word.length + 1 <= maxChars) {
          lines[lines.length - 1] = current + ' ' + word;
        } else if (lines.length < 2) {
          lines.push(word);
        } else {
          lines[1] = current + ' ' + word;
        }
      });

      if (lines[1] && lines[1].length > maxChars) {
        lines[1] = lines[1].slice(0, maxChars - 1).trimEnd() + '…';
      }
      return lines.join('\n');
    },
    createWheel(animation) {
      return new Winwheel({
        canvasId: 'ghibli-wheel',
        numSegments: this.segments.length,
        segments: this.segments,
        innerRadius: 78,
        lineWidth: 4,
        strokeStyle: '#fffaf0',
        textFontSize: 26,
        animation
      });
    },
    buildWheel() {
      if (!this.segments.length || !this.$refs.canvas) {
        this.wheel = null;
        return;
      }
      this.wheel = this.createWheel({ type: 'spinOngoing', duration: 0.5 });
      this.wheel.rotationAngle = 0;
      this.wheel.draw();
      this.spinning = false;
    },
    startSpin() {
      if (this.spinning || !this.segments.length) return;

      this.winner = null;
      this.spinning = true;
      this.wheel = this.createWheel({
        type: 'spinToStop',
        duration: 5,
        spins: 5,
        callbackFinished: this.onFinishSpin
      });

      // Un segment est tiré au sort, puis la roue s'arrête sur son centre.
      const prizeNumber = Math.floor(Math.random() * this.segments.length);
      const segmentAngle = 360 / this.segments.length;
      this.wheel.animation.stopAngle = segmentAngle * prizeNumber - segmentAngle / 2;
      this.wheel.startAnimation();
    },
    onFinishSpin(indicatedSegment) {
      this.spinning = false;
      this.winner = indicatedSegment.text.replace(/\n/g, ' ');
    },
    closeResult() {
      this.winner = null;
    },
    spinAgain() {
      this.winner = null;
      this.$nextTick(this.startSpin);
    }
  },
  mounted() {
    this.buildWheel();
  },
  beforeUnmount() {
    if (this.wheel && this.spinning) {
      this.wheel.stopAnimation(false);
    }
  }
}
</script>

<template>
  <section class="panel wheel-panel">
    <header class="wheel-panel__head">
      <h2>La roue</h2>
      <span class="chip" v-if="movies.length">{{ movies.length }} films en lice</span>
    </header>

    <div class="wheel-stage" v-if="movies.length">
      <div class="wheel-pointer" aria-hidden="true"></div>
      <div class="wheel-ring">
        <canvas
          ref="canvas"
          id="ghibli-wheel"
          class="wheel-canvas"
          :width="canvasSize"
          :height="canvasSize"
        >
          Votre navigateur ne prend pas en charge le canvas.
        </canvas>
        <div class="wheel-hub" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="60%" height="60%">
            <path
              fill="#4c8c7b"
              d="M20 3c-6.6 0-11.5 3-11.5 8.6 0 2 .7 3.7 1.9 5C7.7 18.4 6.3 19.8 5 21.5l1.6 1.2c1.2-1.6 2.5-3 4.5-4.6 1 .4 2.1.6 3.2.6C18 18.7 20 12.6 20 3Z"
            />
            <path
              fill="#3f7d68"
              d="M20 3c-4.6 4.2-7.6 8.6-9.6 14.1l1.6.9C13.7 12.9 16.3 8.4 20 3Z"
            />
          </svg>
        </div>
      </div>

      <button type="button" class="spin-button" :disabled="spinning" @click="startSpin">
        {{ spinning ? 'La roue tourne…' : 'Tourner la roue' }}
      </button>
    </div>

    <div class="wheel-empty" v-else>
      <span class="wheel-empty__icon">✿</span>
      <p class="wheel-empty__title">Tous les films ont été vus&nbsp;!</p>
      <p class="wheel-empty__text">Décochez un titre dans la liste pour relancer la roue.</p>
    </div>

    <Teleport to="body">
      <div class="result-mask" v-if="winner" @click.self="closeResult">
        <div class="result-card" role="dialog" aria-modal="true">
          <button type="button" class="result-close" @click="closeResult" aria-label="Fermer">✕</button>
          <span class="result-eyebrow">Ce soir, vous regardez</span>
          <h3 class="result-title">{{ winner }}</h3>
          <p class="result-text">Installez-vous confortablement, la séance peut commencer.</p>
          <div class="result-actions">
            <button type="button" class="btn-ghost" @click="spinAgain">Relancer</button>
            <button type="button" class="btn-solid" @click="closeResult">Parfait&nbsp;!</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.wheel-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
}

.wheel-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.wheel-panel__head h2 {
  font-size: 1.5rem;
}

.wheel-stage {
  --wheel-size: min(420px, 72vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  padding-top: 0.25rem;
}

.wheel-ring {
  position: relative;
  width: var(--wheel-size);
  height: var(--wheel-size);
  border-radius: 50%;
  background: #fffaf0;
  box-shadow:
    0 0 0 10px #fffaf0,
    0 0 0 13px rgba(63, 125, 104, 0.25),
    0 22px 45px rgba(38, 78, 92, 0.28);
}

.wheel-canvas {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.wheel-hub {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 21%;
  height: 21%;
  border-radius: 50%;
  background: #fffaf0;
  border: 3px solid rgba(63, 125, 104, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1rem, 4vw, 1.4rem);
  box-shadow: inset 0 -2px 6px rgba(38, 78, 92, 0.12);
}

.wheel-pointer {
  width: 30px;
  height: 34px;
  margin-bottom: -16px;
  z-index: 2;
  background: linear-gradient(180deg, #f0a868, #e08b4c);
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  filter: drop-shadow(0 4px 6px rgba(38, 78, 92, 0.35));
}

.spin-button {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 2.4rem;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fffaf0;
  background: linear-gradient(180deg, #4c9a80, var(--forest-dark));
  box-shadow: 0 10px 22px rgba(47, 97, 81, 0.35);
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.spin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(47, 97, 81, 0.4);
  filter: brightness(1.05);
}

.spin-button:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 6px 14px rgba(47, 97, 81, 0.35);
}

.spin-button:disabled {
  cursor: default;
  opacity: 0.65;
  box-shadow: none;
}

.wheel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 3rem 1rem;
  text-align: center;
}

.wheel-empty__icon {
  font-size: 2.4rem;
  color: var(--forest);
}

.wheel-empty__title {
  font-weight: 700;
  font-size: 1.1rem;
}

.wheel-empty__text {
  color: var(--ink-soft);
  font-size: 0.95rem;
}
</style>

<style>
/* Modale de résultat : téléportée dans <body>, donc styles non « scoped ». */
.result-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(24, 54, 62, 0.5);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  animation: result-fade 0.25s ease;
}

.result-card {
  position: relative;
  width: min(430px, 100%);
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  border-radius: 28px;
  background: linear-gradient(180deg, #fffdf7, #f7efdd);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 30px 60px rgba(24, 54, 62, 0.35);
  animation: result-pop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.result-eyebrow {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5c7a75;
}

.result-title {
  margin: 0.5rem 0 0.75rem;
  font-family: 'Baloo 2', 'Quicksand', sans-serif;
  font-size: clamp(1.6rem, 5vw, 2.1rem);
  color: #2f6151;
}

.result-text {
  color: #5c7a75;
  font-size: 0.95rem;
}

.result-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn-solid,
.btn-ghost {
  border-radius: 999px;
  padding: 0.65rem 1.6rem;
  font-family: inherit;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease;
}

.btn-solid {
  border: none;
  color: #fffaf0;
  background: linear-gradient(180deg, #4c9a80, #2f6151);
  box-shadow: 0 10px 20px rgba(47, 97, 81, 0.3);
}

.btn-ghost {
  border: 2px solid rgba(63, 125, 104, 0.35);
  background: transparent;
  color: #2f6151;
}

.btn-solid:hover,
.btn-ghost:hover {
  transform: translateY(-2px);
}

.btn-ghost:hover {
  background: rgba(63, 125, 104, 0.1);
}

.result-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(63, 125, 104, 0.12);
  color: #2f6151;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease;
}

.result-close:hover {
  background: rgba(63, 125, 104, 0.22);
}

@keyframes result-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes result-pop {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
