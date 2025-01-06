import { accessToken } from "../js/accesstoken.js";

let genreMap = {};

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchForm = document.getElementById('searchForm'); // Reference to the form
document.getElementById('fetchButton').addEventListener('click', fetchNextPage);

const clearSearchResultsButton = document.getElementById('clearSearchResults');
clearSearchResultsButton.addEventListener('click', clearSearchResults);

searchButton.addEventListener('click', (event => {
    event.preventDefault(); // Prevent default form submission
    searchInput.focus();
    resetSearchedMovie();
}));

// Handle search on pressing Enter key
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
        searchInput.focus();
        resetSearchedMovie();
    }
});

// Handle search form submission to prevent page refresh
searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    handleSearch(); 
    searchInput.focus();
    resetSearchedMovie()
});

async function init() {
    await fetchGenres();
    await fetchMovies(currentPage);
    setupSearch();
}

init();

let debounceTimeout;

function setupSearch() {
    // Add input event listener to the search input
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout); 

        debounceTimeout = setTimeout(() => {
            const query = searchInput.value;
            if (query) {
                fetchMovieByTitle(query); 
                resetSearchedMovie();
            } else {
                clearSearchResults(); 
            }
        }, 300); // 300ms delay
    });
}

function resetSearchedMovie(){
    document.getElementById('searchedMovie').innerHTML = '';
}

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

async function fetchMovies(page = 1) {
    const apiUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`;
    try {
        const data = await fetchWithAuth(apiUrl);
        renderMovies(data.results); // Render all results without slicing
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

// Function to handle the button click for fetching the next page
function fetchNextPage() {
    currentPage++; 
    fetchMovies(currentPage); 
}

let currentPage = 1; // Track the current page
let totalResults = 0; // Store total results

async function fetchMovieByTitle(title, page = 1) {
    searchPage = page; // Update the search page variable
    const apiUrl = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=${searchPage}&query=${encodeURIComponent(title)}`;
    try {
        const data = await fetchWithAuth(apiUrl);
        totalResults = data.total_results; 
        renderSearchResults(data); 
        renderPagination(); 
    } catch (error) {
        console.error('Error fetching movie data:', error);
        document.getElementById('errorMessage').textContent = 'An error occurred while fetching the movie.';
    }
}

let searchPage = 1; // Track the current page for search results

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = ''; 

    const totalPages = Math.ceil(totalResults / 20); 
    const visiblePages = 5; // Display this many pagination buttons

    // First button (only if totalPages > visiblePages)
    if (searchPage > 1 && totalPages > visiblePages) {
        const firstButton = document.createElement('button');
        firstButton.textContent = 'First';
        firstButton.classList.add('page-button');
        firstButton.classList.add('first-button');
        firstButton.addEventListener('click', () => fetchMovieByTitle(document.getElementById('searchInput').value, 1));
        paginationDiv.appendChild(firstButton);
    }

    // Previous button
    if (searchPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.classList.add('page-button');
        prevButton.classList.add('previous-button');
        prevButton.addEventListener('click', () => fetchMovieByTitle(document.getElementById('searchInput').value, searchPage - 1));
        paginationDiv.appendChild(prevButton);
    }

    // Calculate start and end page numbers
    let startPage = Math.max(1, searchPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage < visiblePages - 1) {
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    // Create page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-button');
        pageButton.addEventListener('click', () => fetchMovieByTitle(document.getElementById('searchInput').value, i));

        if (i === searchPage) {
            pageButton.disabled = true; // Disable the current page button
        }

        paginationDiv.appendChild(pageButton);
    }

    // Next button
    if (searchPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.classList.add('page-button');
        nextButton.classList.add('next-button');
        nextButton.addEventListener('click', () => fetchMovieByTitle(document.getElementById('searchInput').value, searchPage + 1));
        paginationDiv.appendChild(nextButton);
    }

    // Last button (only if totalPages > visiblePages)
    if (searchPage < totalPages && totalPages > visiblePages) {
        const lastButton = document.createElement('button');
        lastButton.textContent = 'Last';
        lastButton.classList.add('page-button');
        lastButton.classList.add('last-button');
        lastButton.addEventListener('click', () => fetchMovieByTitle(document.getElementById('searchInput').value, totalPages));
        paginationDiv.appendChild(lastButton);
    }
}

function renderSearchResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = ''; 

    // Create a div for the results message
    const messageDiv = document.createElement('div');
    messageDiv.setAttribute('class', 'resultsTextContainer')

    console.log(results);

    // Check if there are results
    if (results.results.length === 0) {
        const noResultsText = document.createElement('p');
        noResultsText.textContent = 'No results found.';
        messageDiv.appendChild(noResultsText);
        resultsDiv.appendChild(messageDiv);
        return;
    }

    const displayingResultLength = document.createElement('p');
    const totalPagesText = document.createElement('p');
    const totalResultsText = document.createElement('p');

    displayingResultLength.setAttribute('class', 'resultText');
    totalPagesText.setAttribute('class', 'resultText');
    totalResultsText.setAttribute('class', 'resultText');
    
    console.log(results);
    displayingResultLength.textContent = `Displaying results: ${results.results.length}`;
    totalPagesText.textContent = `Total Pages: ${results.total_pages}`;
    totalResultsText.textContent = `Total Results: ${results.total_results}`;

    
    messageDiv.appendChild(displayingResultLength);
    messageDiv.appendChild(totalPagesText);
    messageDiv.appendChild(totalResultsText)
    resultsDiv.appendChild(messageDiv);

    const galleryDiv = document.createElement('div');

    galleryDiv.setAttribute('class', 'gallery');

    results.results.forEach(movie => {
        const imageContainer = document.createElement('div');
        const img = document.createElement('img');

        imageContainer.setAttribute('class', 'small-gallery-img');

        img.src = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : '../img/sad-outline.svg';

        img.alt = movie.title;
        img.classList.add('result-image');
        img.addEventListener('click', () => {
            renderMovie(movie); 
        });

        imageContainer.appendChild(img);
        galleryDiv.appendChild(imageContainer);
    });

    resultsDiv.appendChild(galleryDiv);
}

function handleSearch() {
    const query = searchInput.value;
    if (query) {
        fetchMovieByTitle(query);
    }
}

function clearSearchResults() {
    document.getElementById('searchedMovie').innerHTML = '';
    console.log('Clearing search results');
    const searchInput = document.getElementById('searchInput');
    searchInput.removeAttribute('required'); 
    searchInput.value = ''; 
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('pagination').innerHTML = ''; 
    searchInput.setAttribute('required', '');
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
            <div class="img-container">
                <img class="img-movie-highlight" src="${posterSrc}" alt="${movie.title}">
            </div>
            <h2>${movie.title} (${movie.release_date.split('-')[0]})</h2>
            <p><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Vote Average:</strong> ${movie.vote_average} (${movie.vote_count} votes)</p>
            <p><strong>Genres:</strong> <span class="genres">${genresList}</span></p>
        </div>
    `;
}




// //get one movie, deprecated right now
// async function fetchMovieData(movieId) {
//     const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}`;
//     try {
//         const data = await fetchWithAuth(apiUrl);
//         renderSpecificMovie(data);
//     } catch (error) {
//         console.error('Error fetching movie data:', error);
//     }
// }

// function renderSpecificMovie(data) {
//     const contentDiv = document.getElementById('content');
//     const genresList = data.genres.map(genre => `<span class="genre">${genre.name}</span>`).join('');
//     contentDiv.innerHTML = createSpecificMovieHTML(data, genresList);
// }

// function createSpecificMovieHTML(data, genresList) {

//     // Set the image source based on the availability of poster_path
//     const posterSrc = movie.poster_path 
//         ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
//         : '../img/sad-outline.svg';

//     return `
//         <div class="movie">
//             <h1>${data.title} (${data.release_date.split('-')[0]})</h1>
//             <img src="${posterSrc}" alt="${movie.title}">
//             <p><strong>Tagline:</strong> ${data.tagline}</p>
//             <p><strong>Overview:</strong> ${data.overview}</p>
//             <p><strong>Genres:</strong> <span class="genres">${genresList}</span></p>
//             <p><strong>Production Companies:</strong> ${data.production_companies.map(pc => pc.name).join(', ')}</p>
//             <p><strong>Release Date:</strong> ${data.release_date}</p>
//             <p><strong>Status:</strong> ${data.status}</p>
//             <p><strong>Vote Average:</strong> ${data.vote_average} (${data.vote_count} votes)</p>
//             <p><strong>Budget:</strong> $${data.budget.toLocaleString()}</p>
//             <p><strong>Revenue:</strong> $${data.revenue.toLocaleString()}</p>
//             <p><strong>Homepage:</strong> <a href="${data.homepage}" target="_blank">${data.homepage}</a></p>
//         </div>
//     `;
// }