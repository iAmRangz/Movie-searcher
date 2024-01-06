const apiKey = '1bfdbff05c2698dc917dd28c08d41096';
const moviesContainer = document.getElementById('movies-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
let pageNumber = 1;

const createMovieElement = (movie) => `
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

const fetchMovies = async (page) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=${page}`);
        const movies = response.data.results;

        moviesContainer.innerHTML = movies.map(createMovieElement).join('');

    } catch (error) {
        console.error('Error fetching movies:', error);
    }
};

const searchMovies = async (query) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`);
        const movies = response.data.results;

        moviesContainer.innerHTML = movies.map(createMovieElement).join('');

    } catch (error) {
        console.error('Error searching movies:', error);
    }
};

const navigateToNextPage = () => {
    pageNumber++;
    fetchMovies(pageNumber);
};

const navigateToPrevPage = () => {
    if (pageNumber > 1) {
        pageNumber--;
        fetchMovies(pageNumber);
    }
};

const hideMoviePoster = (movieId) => {
    const moviePoster = document.querySelector(`.movie[data-id="${movieId}"] img`);
    if (moviePoster) {
        moviePoster.style.display = 'none';
    }
};

const displayMoviePoster = (movieId) => {
    const moviePoster = document.querySelector(`.movie[data-id="${movieId}"] img`);
    if (moviePoster) {
        moviePoster.style.display = 'block';
    }
};

const displaySimilarMovieDetails = async (similarMovie) => {
    const movieData = {
        id: similarMovie.id,
        title: similarMovie.title,
        poster_path: similarMovie.poster_path,
        release_date: similarMovie.release_date,
        overview: similarMovie.overview
    };
    displayDetails(movieData);
};

const displayDetails = async (movie) => {
    const movieId = movie.id;
    hideMoviePoster(movieId);

    try {
        const [
            movieResponse,
            creditsResponse,
            similarResponse
        ] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`),
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`),
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${apiKey}&language=en-US`)
        ]);

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
                <div class="similar-movie" data-id="${similarMovie.id}">
                    <img src="http://image.tmdb.org/t/p/w200/${similarMovie.poster_path}" alt="${similarMovie.title}">
                    <h4>${similarMovie.title}</h4>
                </div>
            `;
        });

        similarMoviesHtml += '</div>';
        similarMoviesDiv.innerHTML = similarMoviesHtml;
        detailsDiv.appendChild(similarMoviesDiv);
        overlay.appendChild(detailsDiv);

        attachSimilarMoviesClickListener(similarMovies);

    } catch (error) {
        console.error('Error displaying details:', error);
    } finally {
        displayMoviePoster(movieId);
    }
};

const attachSimilarMoviesClickListener = (similarMovies) => {
    const detailsDiv = document.querySelector('.overlay-content');

    if (detailsDiv) {
        const similarMoviesDiv = detailsDiv.querySelector('.similar-movies');

        if (similarMoviesDiv) {
            similarMoviesDiv.addEventListener('click', (event) => {
                const similarMovieElement = event.target.closest('.similar-movie');
                if (similarMovieElement) {
                    const similarMovieId = parseInt(similarMovieElement.getAttribute('data-id'));
                    const selectedSimilarMovie = similarMovies.find(movie => movie.id === similarMovieId);
                    if (selectedSimilarMovie) {
                        displaySimilarMovieDetails(selectedSimilarMovie);
                    }
                }
            });
        }
    }
};

window.addEventListener('load', () => {
    fetchMovies(pageNumber);
});

searchBtn.addEventListener('click', () => {
    const searchQuery = searchInput.value;
    searchMovies(searchQuery);
});

prevPageBtn.addEventListener('click', navigateToPrevPage);
nextPageBtn.addEventListener('click', navigateToNextPage);

moviesContainer.addEventListener('dblclick', (event) => {
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

const sortMovies = (criterion) => {
    const movies = Array.from(document.querySelectorAll('.movie'));
    movies.sort((a, b) => {
        const valueA = a.getAttribute(`data-${criterion}`);
        const valueB = b.getAttribute(`data-${criterion}`);
        if (criterion === 'release-date') {
            return new Date(valueB) - new Date(valueA);
        } else if (criterion === 'title') {
            return valueA.localeCompare(valueB);
        }
    });
    moviesContainer.innerHTML = '';
    movies.forEach((movie) => {
        moviesContainer.appendChild(movie);
    });
};

document.getElementById('sort-options').addEventListener('change', (event) => {
    const selectedCriterion = event.target.value;
    if (selectedCriterion === 'default') {
        fetchMovies(pageNumber)
    } else {
        sortMovies(selectedCriterion);
    }
});