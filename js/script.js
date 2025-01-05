import { accessToken } from "../js/accesstoken.js";

let genreMap = {};

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchForm = document.getElementById('searchForm'); // Reference to the form

// Handle search on button click
searchButton.addEventListener('click', handleSearch);

// Handle search on pressing Enter key
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Handle search form submission to prevent page refresh
searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    handleSearch(); 
});

document.getElementById('fetchButton').addEventListener('click', fetchMovies);

async function init() {
    await fetchGenres();
    await fetchMovies();
}

init();

async function fetchWithAuth(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

async function fetchGenres() {
    const apiUrl = `https://api.themoviedb.org/3/genre/movie/list`;
    try {
        const data = await fetchWithAuth(apiUrl);
        genreMap = Object.fromEntries(data.genres.map(genre => [genre.id, genre.name]));
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

async function fetchMovies() {
    const apiUrl = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
    try {
        const data = await fetchWithAuth(apiUrl);
        renderMovies(data.results.slice(0, 10));
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

let currentPage = 1; // Track the current page
let totalResults = 0; // Store total results

async function fetchMovieByTitle(title, page = 1) {
    const apiUrl = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=${page}&query=${encodeURIComponent(title)}`;
    try {
        const data = await fetchWithAuth(apiUrl);
        totalResults = data.total_results; 
        currentPage = page; 
        renderSearchResults(data.results); 
        renderPagination(); 
    } catch (error) {
        console.error('Error fetching movie data:', error);
        document.getElementById('errorMessage').textContent = 'An error occurred while fetching the movie.';
    }
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = ''; 

    const totalPages = Math.ceil(totalResults / 20); 

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-button');
        

        pageButton.addEventListener('click', () => {
            fetchMovieByTitle(document.getElementById('searchInput').value, i);
        });

 
        if (i === currentPage) {
            pageButton.disabled = true;
        }

        paginationDiv.appendChild(pageButton);
    }
}

function renderSearchResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ''; 

    const totalResultsText = document.createElement('p');
    totalResultsText.textContent = `Total results: ${results.length}`;
    resultsDiv.appendChild(totalResultsText);

    results.forEach(movie => {
        const imageContainer = document.createElement('div');
        const img = document.createElement('img');

        if(movie.poster_path != null){
            img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        } else {
            img.src = '../img/sad-outline.svg';
        }
        

        img.alt = movie.title;
        img.classList.add('result-image');
        img.addEventListener('click', () => {
            renderMovie(movie); // Show more info on click
        });

        imageContainer.appendChild(img);
        resultsDiv.appendChild(imageContainer);
    });
}

function handleSearch() {
    const query = searchInput.value;
    if (query) {
        fetchMovieByTitle(query);
    }
}

function clearSearchResults() {
    document.getElementById('searchedMovie').innerHTML = '';
    document.getElementById('searchResults').innerHTML = '';
}

function renderMovie(movie) {
    const contentDiv = document.getElementById('searchedMovie');
    contentDiv.innerHTML = createMovieHTML(movie);
}

function renderMovies(movies) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = movies.map(createMovieHTML).join('');
}

function createMovieHTML(movie) {
    const genresList = movie.genre_ids.map(id => `<span class="genre">${genreMap[id]}</span>`).join('');
    
    // Set the image source based on the availability of poster_path
    const posterSrc = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : '../img/sad-outline.svg';

    return `
        <div class="movie">
            <h2>${movie.title} (${movie.release_date.split('-')[0]})</h2>
            <img src="${posterSrc}" alt="${movie.title}">
            <p><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Vote Average:</strong> ${movie.vote_average} (${movie.vote_count} votes)</p>
            <p><strong>Genres:</strong> <span class="genres">${genresList}</span></p>
        </div>
    `;
}

async function fetchMovieData(movieId) {
    const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}`;
    try {
        const data = await fetchWithAuth(apiUrl);
        renderSpecificMovie(data);
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

function renderSpecificMovie(data) {
    const contentDiv = document.getElementById('content');
    const genresList = data.genres.map(genre => `<span class="genre">${genre.name}</span>`).join('');
    contentDiv.innerHTML = createSpecificMovieHTML(data, genresList);
}

function createSpecificMovieHTML(data, genresList) {

    // Set the image source based on the availability of poster_path
    const posterSrc = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : '../img/sad-outline.svg';

    return `
        <div class="movie">
            <h1>${data.title} (${data.release_date.split('-')[0]})</h1>
            <img src="${posterSrc}" alt="${movie.title}">
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
}