<script>
import { update } from 'firebase/database';

export default {
  name: 'ListMovies',
  emits: ['update:movies', 'add:movie'],
  props: {
    movies: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    saving: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      newTitle: '',
      formError: ''
    };
  },
  watch: {
    newTitle() {
      this.formError = '';
    }
  },
  computed: {
    watchedCount() {
      return this.movies.filter(movie => movie.alreadyWatched).length;
    },
    remainingCount() {
      return this.movies.length - this.watchedCount;
    },
    progress() {
      if (!this.movies.length) return 0;
      return Math.round((this.watchedCount / this.movies.length) * 100);
    },
    trimmedTitle() {
      return this.newTitle.trim();
    }
  },
  methods: {
    // Comparaison souple : ni la casse ni les accents ne doivent créer un doublon.
    isDuplicate(title) {
      return this.movies.some(
        movie => movie.title.localeCompare(title, 'fr', { sensitivity: 'base' }) === 0
      );
    },
    submitNewMovie() {
      const title = this.trimmedTitle;
      if (!title) return;

      if (this.isDuplicate(title)) {
        this.formError = 'Ce film est déjà dans la liste.';
        return;
      }

      this.$emit('add:movie', title);
      this.newTitle = '';
    },
    updateMovieStatus(event,movie) {
      if (movie) {
        movie.alreadyWatched = event.target.checked;
        // Emit an event to update the movie status in the parent component
        this.$emit('update:movies', movie);
      }
    }
  }
}
</script>
<template>
    <section class="panel movie-panel">
        <header class="movie-panel__head">
            <div>
                <h2>Les films</h2>
                <p class="movie-panel__hint">Cochez ceux que vous avez déjà vus.</p>
            </div>
            <span class="chip" v-if="movies.length">{{ remainingCount }} à voir</span>
        </header>

        <div class="progress" v-if="movies.length">
            <div class="progress__bar">
                <div class="progress__fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="progress__label">{{ watchedCount }} / {{ movies.length }} vus</span>
        </div>

        <p class="movie-panel__empty" v-if="loading">Chargement de la filmothèque…</p>
        <p class="movie-panel__empty" v-else-if="!movies.length">Aucun film pour le moment.</p>

        <ul class="movie-list">
            <li v-for="movie in movies" :key="movie.title">
                <label class="movie" :class="{ 'movie--watched': movie.alreadyWatched }">
                    <input
                        type="checkbox"
                        class="movie__input"
                        :value="movie.title"
                        v-model="movie.alreadyWatched"
                        v-on:change="updateMovieStatus($event, movie)"
                    />
                    <span class="movie__box" aria-hidden="true"></span>
                    <span class="movie__title">{{ movie.title }}</span>
                </label>
            </li>
        </ul>

        <form class="add-form" @submit.prevent="submitNewMovie">
            <label class="add-form__label" for="new-movie">Ajouter un film</label>
            <div class="add-form__row">
                <input
                    id="new-movie"
                    type="text"
                    class="add-form__input"
                    v-model="newTitle"
                    maxlength="80"
                    autocomplete="off"
                    placeholder="Titre du film…"
                />
                <button
                    type="submit"
                    class="add-form__button"
                    :disabled="!trimmedTitle || saving"
                    :aria-label="'Ajouter ' + (trimmedTitle || 'un film')"
                >
                    <span v-if="saving" class="add-form__spinner" aria-hidden="true"></span>
                    <span v-else aria-hidden="true">+</span>
                </button>
            </div>
            <p class="add-form__error" v-if="formError || error">{{ formError || error }}</p>
        </form>
    </section>
</template>

<style scoped>
.movie-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.movie-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.movie-panel__head h2 {
  font-size: 1.5rem;
}

.movie-panel__hint {
  color: var(--ink-soft);
  font-size: 0.88rem;
}

.movie-panel__empty {
  color: var(--ink-soft);
  font-size: 0.92rem;
  padding: 0.5rem 0;
}

.progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress__bar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: rgba(63, 125, 104, 0.14);
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--forest), #7cb894);
  transition: width 0.4s ease;
}

.progress__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ink-soft);
  white-space: nowrap;
}

.movie-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: min(30rem, 58vh);
  overflow-y: auto;
  padding-right: 0.25rem;
  margin: 0 -0.35rem;
}

.movie-list::-webkit-scrollbar {
  width: 6px;
}

.movie-list::-webkit-scrollbar-thumb {
  background: rgba(63, 125, 104, 0.25);
  border-radius: 999px;
}

.movie {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.7rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.movie:hover {
  background: rgba(255, 255, 255, 0.75);
  transform: translateX(2px);
}

.movie__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.movie__box {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 7px;
  border: 2px solid rgba(63, 125, 104, 0.45);
  background: rgba(255, 255, 255, 0.9);
  position: relative;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.movie__box::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg) scale(0);
  transition: transform 0.18s ease;
}

.movie__input:checked + .movie__box {
  background: var(--forest);
  border-color: var(--forest);
}

.movie__input:checked + .movie__box::after {
  transform: rotate(45deg) scale(1);
}

.movie__input:focus-visible + .movie__box {
  box-shadow: var(--ring);
}

.movie__title {
  font-size: 0.98rem;
  font-weight: 600;
  text-align: left;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.9rem;
  border-top: 1px dashed rgba(63, 125, 104, 0.25);
}

.add-form__label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ink-soft);
  text-align: left;
}

.add-form__row {
  display: flex;
  gap: 0.5rem;
}

.add-form__input {
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.9rem;
  border-radius: 999px;
  border: 2px solid rgba(63, 125, 104, 0.25);
  background: rgba(255, 255, 255, 0.85);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.add-form__input::placeholder {
  color: rgba(92, 122, 117, 0.65);
  font-weight: 500;
}

.add-form__input:focus {
  outline: none;
  border-color: var(--forest);
  background: #fff;
}

.add-form__button {
  flex: none;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  font-size: 1.4rem;
  line-height: 1;
  color: #fffaf0;
  background: linear-gradient(180deg, #4c9a80, var(--forest-dark));
  box-shadow: 0 8px 16px rgba(47, 97, 81, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, filter 0.2s ease, opacity 0.2s ease;
}

.add-form__button:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.add-form__button:disabled {
  cursor: default;
  opacity: 0.45;
  box-shadow: none;
}

.add-form__spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 250, 240, 0.4);
  border-top-color: #fffaf0;
  animation: add-spin 0.7s linear infinite;
}

@keyframes add-spin {
  to {
    transform: rotate(360deg);
  }
}

.add-form__error {
  font-size: 0.85rem;
  font-weight: 600;
  color: #b4553f;
  text-align: left;
}

.movie--watched .movie__title {
  color: var(--ink-soft);
  opacity: 0.65;
  text-decoration: line-through;
  text-decoration-color: rgba(92, 122, 117, 0.5);
}
</style>
