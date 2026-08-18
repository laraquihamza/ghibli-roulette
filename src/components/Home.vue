<script>
import { database } from '../database';
import { ref, set, get, update } from 'firebase/database';
import ListMovies from './ListMovies.vue';
import WheelContainer from './WheelContainer.vue';
export default {
  name: 'Home',
  components: {
    ListMovies,
    WheelContainer
  },
  data() {
    return {
      movies: [],
      loading: true,
      saving: false,
      saveError: ''
    };
  },
  computed: {
    moviesToWheel() {
      return this.movies.filter(movie => !movie.alreadyWatched);
    }
  },
  methods: {
    async fetchMovies() {
      try {
            const moviesRef = ref(database, 'movies');
        const snapshot = await get(moviesRef);
        
        // Assuming you have a Firebase database set up
        if (snapshot.exists()) {
          this.movies = snapshot.val();
        } else {
          console.log("No movies found in Firebase.");
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        this.loading = false;
      }
    },
    async updateMovieStatus(movie) {
      try {
        let index = this.movies.findIndex(m => m.title === movie.title);
        this.movies[index] = movie;
        const moviesRef = ref(database, 'movies');
        await set(moviesRef, this.movies);
        console.log("Movie status updated successfully.");
      } catch (error) {
        console.error("Error updating movie status:", error);
      }
    },
    async addMovie(title) {
      const previousMovies = this.movies;
      this.saving = true;
      this.saveError = '';
      // Ajout optimiste : la roue et la liste se mettent à jour tout de suite.
      this.movies = [...this.movies, { title, alreadyWatched: false }];
      try {
        const moviesRef = ref(database, 'movies');
        await set(moviesRef, this.movies);
        console.log("Movie added successfully.");
      } catch (error) {
        console.error("Error adding movie:", error);
        this.movies = previousMovies;
        this.saveError = "Impossible d'enregistrer le film. Réessayez.";
      } finally {
        this.saving = false;
      }
    },
  },
  mounted(){
    // Fetch movies from the database
    this.fetchMovies();
  }
}
</script>
<template>
  <div class="page">
    <header class="hero">
      <span class="chip">Studio Ghibli</span>
      <h1>La roue des films</h1>
      <p class="hero-subtitle">
        Impossible de se décider&nbsp;? Cochez les films déjà vus, puis laissez la roue
        choisir la séance de ce soir.
      </p>
    </header>

    <div class="home-container">
      <ListMovies
        :movies="movies"
        :loading="loading"
        :saving="saving"
        :error="saveError"
        @update:movies="updateMovieStatus"
        @add:movie="addMovie"
      ></ListMovies>
      <WheelContainer :movies="moviesToWheel"></WheelContainer>
    </div>

    <footer class="page-footer">
      <span>✿</span>
      <span>Bon film, et n'oubliez pas le popcorn.</span>
      <span>✿</span>
    </footer>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
}

.hero h1 {
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  letter-spacing: -0.01em;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.6);
}

.hero-subtitle {
  max-width: 34rem;
  color: var(--ink-soft);
  font-size: 1.02rem;
}

.home-container {
  display: grid;
  grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
  gap: 1.75rem;
  align-items: start;
}

.page-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
  opacity: 0.85;
}

@media screen and (max-width: 900px) {
  .home-container {
    grid-template-columns: minmax(0, 1fr);
  }

  /* Sur mobile, la roue passe en premier : c'est elle que l'on vient chercher. */
  .home-container > :last-child {
    order: -1;
  }
}
</style>
