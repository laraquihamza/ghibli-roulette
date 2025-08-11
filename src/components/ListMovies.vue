<script>
import { update } from 'firebase/database';

export default {
  name: 'ListMovies',
  emits: ['update:movies'],
  props: {
    movies: {
      type: Array,
      required: true
    }
  },
  methods: {
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
    <div style="margin-right: 20px;">
        <h2>Roue Studio Ghibli</h2>
        <ul>
        <li v-for="movie in movies" :key="movie.title">
            <input type="checkbox" :value="movie.title" v-model="movie.alreadyWatched" v-on:change="updateMovieStatus($event, movie)" />{{ movie.title }}
        </li>
        </ul>
    </div>
</template>