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


function displayDetails(movie) {
    axios
        .get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`)
        .then(response => {
            const movieDetails = response.data;

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('details');

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                document.body.removeChild(detailsDiv);
            });

            const similarMoviesButton = document.createElement('button');
            similarMoviesButton.textContent = 'Get Similar Movies';
            similarMoviesButton.addEventListener('click', async () => {
                try {
                    const similarResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${apiKey}`);
                    const similarMovies = similarResponse.data.results;

                    let similarMoviesHtml = '<h3>Similar Movies:</h3>';
                    similarMovies.forEach(similarMovie => {
                        similarMoviesHtml += getMovieHtml(similarMovie);
                    });

                    detailsDiv.innerHTML += similarMoviesHtml;
                } catch (error) {
                    console.log(error);
                }
            });

            detailsDiv.innerHTML = `
                <h2>${movieDetails.title}</h2>
                <img src="http://image.tmdb.org/t/p/w500/${movieDetails.poster_path}" alt="${movieDetails.title}">
                <p>Release Date: ${movieDetails.release_date}</p>
                <p>Overview: ${movieDetails.overview}</p>
            `;

            detailsDiv.appendChild(closeButton);
            detailsDiv.appendChild(similarMoviesButton);

            document.body.appendChild(detailsDiv);
        })
        .catch(error => {
            console.log(error);
        });
}



moviesContainer.addEventListener('dblclick', event => {
    const movieElement = event.target.closest('.movie');
    if (movieElement) {
        const movieData = {
            id: movieElement.getAttribute('data-id'),
            title: movieElement.getAttribute('data-title'),
            poster_path: movieElement.getAttribute('data-poster-path'),
            release_date: movieElement.getAttribute('data-release-date'),
            overview: movieElement.getAttribute('data-overview')
        };
        displayDetails(movieData);
    }
});