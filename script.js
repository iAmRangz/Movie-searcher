const apiKey = '1bfdbff05c2698dc917dd28c08d41096';
const moviesContainer = document.getElementById('movies-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
let pageNumber = 1;

// Function to create a movie element HTML
const createMovieElement = (movie) => {
    const {id, title, poster_path, release_date, overview} = movie;
    return `
        <div class="movie" 
             data-id="${id}"
             data-title="${title}"
             data-poster-path="${poster_path}"
             data-release-date="${release_date}"
             data-overview="${overview}">
            <img src="http://image.tmdb.org/t/p/w500/${poster_path}" alt="${title}">
            <h3>${title}</h3>
        </div>
    `;
};

// Fetches movies based on the provided page number
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
        // Fetching movie details, credits, and similar movies in parallel
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

        // Creating and populating the overlay
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

        // Extracting director, genres, and cast information
        const director = credits.crew.find(member => member.job === 'Director');
        const directorName = director ? director.name : 'N/A';
        const genres = movieDetails.genres.map(genre => genre.name).join(', ');
        const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');

        // Populating the details section of the overlay
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

        // Creating and appending the similar movies section to the overlay
        const similarMoviesDiv = createSimilarMoviesDiv(similarMovies);
        detailsDiv.appendChild(similarMoviesDiv);

        overlay.appendChild(detailsDiv);

        attachSimilarMoviesClickListener(similarMovies);

    } catch (error) {
        console.error('Error displaying details:', error);
    } finally {
        displayMoviePoster(movieId);
    }
};

// Function to create the HTML structure for similar movies section
const createSimilarMoviesDiv = (similarMovies) => {
    const similarMoviesDiv = document.createElement('div');
    similarMoviesDiv.classList.add('similar-movies');

    let similarMoviesHtml = '<h3>Similar Movies:</h3><div class="similar-movies-container">';
    similarMovies.forEach(similarMovie => {
        similarMoviesHtml += `
            <div class="similar-movie" data-id="${similarMovie.id}">
                <h4>${similarMovie.title}</h4>
                <img src="http://image.tmdb.org/t/p/w200/${similarMovie.poster_path}" alt="${similarMovie.title}">
            </div>
        `;
    });

    similarMoviesHtml += '</div>';
    similarMoviesDiv.innerHTML = similarMoviesHtml;

    return similarMoviesDiv;
};


// Function to handle similar movie click
const handleSimilarMovieClick = (event, similarMovies) => {
    const similarMovieElement = event.target.closest('.similar-movie');
    if (similarMovieElement) {
        const similarMovieId = parseInt(similarMovieElement.getAttribute('data-id'));
        const selectedSimilarMovie = similarMovies.find(movie => movie.id === similarMovieId);
        if (selectedSimilarMovie) {
            displaySimilarMovieDetails(selectedSimilarMovie);
        }
    }
};

// Function to attach similar movies click event
const attachSimilarMoviesClickListener = (similarMovies) => {
    const overlay = document.getElementById('overlay');

    overlay.addEventListener('click', (event) => {
        const similarMoviesDiv = document.querySelector('.similar-movies');

        if (similarMoviesDiv && event.target.closest('.similar-movies')) {
            handleSimilarMovieClick(event, similarMovies);
        }
    });
};

// Function to handle search by Enter key press
const handleSearchByEnter = (event) => {
    if (event.key === 'Enter') {
        const searchQuery = searchInput.value;
        searchMovies(searchQuery);
    }
};

window.addEventListener('load', () => {
    fetchMovies(pageNumber);

    // Event listener for "Enter" key press in search input
    searchInput.addEventListener('keypress', handleSearchByEnter);
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


document.getElementById('title').addEventListener('click', () => {
    pageNumber = 1;
    fetchMovies(pageNumber);
});
