// Fixed page number for now.
let pageNumber = 1;
const apiKey = '1bfdbff05c2698dc917dd28c08d41096';

const upcomingUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=${pageNumber}`;

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const moviesContainer = document.getElementById('movies-container');


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
        .all([
            axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`),
            axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${apiKey}`),
            axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/similar?api_key=${apiKey}&language=en-US`)
        ])
        .then(axios.spread((movieResponse, creditsResponse, similarResponse) => {
            const movieDetails = movieResponse.data;
            const credits = creditsResponse.data;
            const similarMovies = similarResponse.data.results;

            const overlay = document.getElementById('overlay');
            overlay.innerHTML = ''; // Clear previous details
            overlay.classList.add('active');

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('overlay-content');

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => {
                overlay.classList.remove('active');
            });

            const director = credits.crew.find(member => member.job === 'Director');
            const directorName = director ? director.name : 'N/A';
            const genres = movieDetails.genres.map(genre => genre.name).join(', ');
            const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');

            detailsDiv.innerHTML = `
        <h2>${movieDetails.title}</h2>
        <div class="details-container">
            <div class="movie-details">
                <p><b>Release Date:</b> ${movieDetails.release_date}</p>
                <p><b>Director:</b> ${directorName}</p>
                <p><b>Genres:</b> ${genres}</p>
                <p><b>Cast:</b> ${cast}</p>
                <p><b>Overview:</b> ${movieDetails.overview}</p>
            </div>
            <div class="movie-poster">
                <img src="http://image.tmdb.org/t/p/w300/${movieDetails.poster_path}" alt="${movieDetails.title}">
            </div>
        </div>
    `;

            detailsDiv.appendChild(closeButton);

            // Div for similar movies
            const similarMoviesDiv = document.createElement('div');
            similarMoviesDiv.classList.add('similar-movies');

            let similarMoviesHtml = '<h3>Similar Movies:</h3><div class="similar-movies-container">';
            similarMovies.forEach(similarMovie => {
                similarMoviesHtml += `
                    <div class="similar-movie">
                        <img src="http://image.tmdb.org/t/p/w200/${similarMovie.poster_path}" alt="${similarMovie.title}">
                        <h4>${similarMovie.title}</h4>
                    </div>
                `;
            });
            similarMoviesHtml += '</div>';

            similarMoviesDiv.innerHTML = similarMoviesHtml;
            detailsDiv.appendChild(similarMoviesDiv);

            overlay.appendChild(detailsDiv);
        }))
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