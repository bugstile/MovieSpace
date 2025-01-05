import {accessToken} from "../js/accesstoken.js";

document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value;
    if (query) {
        await fetchMovieByTitle(query);
    }
});

document.getElementById('fetchButton').addEventListener('click', async () => {
    fetchMovies();
});

async function fetchMovieByTitle(title) {
    const apiUrl = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${encodeURIComponent(title)}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        if (data.results.length > 0) {
            renderMovie(data.results[0]); // Render the first result
            document.getElementById('errorMessage').textContent = ''; // Clear any previous error messages
        } else {
            document.getElementById('searchedMovie').innerHTML = '';
            document.getElementById('errorMessage').textContent = 'No results found.';
        }
    } catch (error) {
        console.error('Error fetching movie data:', error);
        document.getElementById('errorMessage').textContent = 'An error occurred while fetching the movie.';
    }
}

function renderMovie(movie) {
    const contentDiv = document.getElementById('searchedMovie');
    const movieHTML = `
        <div class="movie">
            <h2>${movie.title} (${movie.release_date.split('-')[0]})</h2>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <p><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Vote Average:</strong> ${movie.vote_average} (${movie.vote_count} votes)</p>
        </div>
    `;

    contentDiv.innerHTML = movieHTML;
}



async function fetchMovies() {
    const apiUrl = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        renderMovies(data.results.slice(0, 10)); // Render only the first 10 movies
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

function renderMovies(movies) {
    const contentDiv = document.getElementById('content');
    const moviesHTML = movies.map(movie => {
        const genresList = movie.genre_ids.map(id => `<span class="genre">${id}</span>`).join(''); // Here you would map genre IDs to names if you have a mapping

        return `
            <div class="movie">
                <h2>${movie.title} (${movie.release_date.split('-')[0]})</h2>
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Vote Average:</strong> ${movie.vote_average} (${movie.vote_count} votes)</p>
                <p><strong>Genres:</strong> <span class="genres">${genresList}</span></p>
            </div>
        `;
    }).join('');

    contentDiv.innerHTML = moviesHTML;
}

// Fetch movie data when the script runs
fetchMovies();

async function fetchMovieData() {
    const apiUrl = 'https://api.themoviedb.org/3/movie/11';

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        renderSpecificMovie(data);
        console.log(data);
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}


function renderSpecificMovie(data) {
    const contentDiv = document.getElementById('content');
    const genresList = data.genres.map(genre => `<span class="genre">${genre.name}</span>`).join('');

    const movieHTML = `
        <div class="movie">
            <h1>${data.title} (${data.release_date.split('-')[0]})</h1>
            <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">
            <p><strong>Tagline:</strong> ${data.tagline}</p>
            <p><strong>Overview:</strong> ${data.overview}</p>
            <p><strong>Genres:</strong> <span class="genres">${genresList}</span></p>
            <p><strong>Production Companies:</strong> ${data.production_companies.map(pc => pc.name).join(', ')}</p>
            <p><strong>Release Date:</strong> ${data.release_date}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Vote Average:</strong> ${data.vote_average} (${data.vote_count} votes)</p>
            <p><strong>Budget:</strong> $${data.budget.toLocaleString()}</p>
            <p><strong>Revenue:</strong> $${data.revenue.toLocaleString()}</p>
            <p><strong>Homepage:</strong> <a href="${data.homepage}" target="_blank">${data.homepage}</a></p>
        </div>
    `;

    contentDiv.innerHTML = movieHTML;
}