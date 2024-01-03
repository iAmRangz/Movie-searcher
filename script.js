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
        <div class="movie" 
             data-id="${movie.id}"
             data-title="${movie.title}"
             data-poster-path="${movie.poster_path}"
             data-release-date="${movie.release_date}"
             data-overview="${movie.overview}">
            <img src="http://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
        </div>
    `;
}

// Get upcoming movies on load
window.addEventListener('load', async () => {

    try {
        const response = await axios.get(upcomingUrl);
        const movies = response.data.results;

        let moviesHtml = '';
        movies.forEach(movie => {
            moviesHtml += getMovieHtml(movie);
        });
        moviesContainer.innerHTML = moviesHtml;

    } catch (error) {
        console.log(error);
    }

});


// Search movies
async function searchMovies(query) {

    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;

    try {
        const response = await axios.get(searchUrl);
        const movies = response.data.results;

        let moviesHtml = '';
        movies.forEach(movie => {
            moviesHtml += getMovieHtml(movie);
        });
        moviesContainer.innerHTML = moviesHtml;

    } catch (error) {
        console.log(error);
    }
}

// Search event
searchBtn.addEventListener('click', () => {
    const searchQuery = searchInput.value;
    searchMovies(searchQuery);
});


