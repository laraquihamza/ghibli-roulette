<script>
import Winwheel from 'vue-winwheel';
export default {
  name: 'WheelContainer',
  components: {Winwheel},
    props: {
        movies: {
        type: Array,
        required: true
        }
    },
    computed: {
        wheelOptions() {
            return this.movies.map((movie,index)=>{
                    return {
                        textFillStyle: index % 2 === 0 ? '#000000' : '#FFFFFF', // Alternate colors for text
                        text: movie.title,
                        fillStyle: index % 2 === 0 ? '#FFFFFF' : '#000000', // Alternate colors for segments
                    }
                })
        }
    },
    watch: {
        movies: {
            handler(newMovies) {
                // This will trigger when movies prop changes
                console.log('Movies updated:', newMovies);
            },
            deep: true // Watch for changes in the array elements
        }
    },
  methods: {},
  mounted() {

    // Any initialization logic can go here
  }
}
</script>
<template>
  <div v-if="wheelOptions.length > 0">
    <Winwheel :key="movies" :segments="wheelOptions" />
  </div>
</template>