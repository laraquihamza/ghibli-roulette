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
      movies: []
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
  },
  mounted(){
    // Fetch movies from the database
    this.fetchMovies();
  }
}
</script>
<template>
  <div class="home-container">
    <ListMovies :movies="movies" @update:movies="updateMovieStatus"></ListMovies>
    <WheelContainer :movies="moviesToWheel"></WheelContainer>
  </div>
</template>