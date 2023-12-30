// Fixed page number for now.
let pageNumber = 1;
const apiKey = '1bfdbff05c2698dc917dd28c08d41096';

const upcomingUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=${pageNumber}`;

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const moviesContainer = document.getElementById('movies-container');


// Build movie HTML
function getMovieHtml(movie) {

    return `
    <div class="movie">
      <img src="http://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
    </div>
  `;

}

// Get upcoming movies on load
window.addEventListener('load', async () => {
    const response = await axios.get(upcomingUrl);
    const movies = response.data.results;

    let moviesHtml = '';
    movies.forEach(movie => {
        moviesHtml += getMovieHtml(movie);
    });
    moviesContainer.innerHTML = moviesHtml;
});