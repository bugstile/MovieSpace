import { accessToken } from "../js/accesstoken.js";

let genreMap = {};

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchForm = document.getElementById('searchForm'); // Reference to the form
document.getElementById('fetchButton').addEventListener('click', fetchNextPage);

const clearSearchResultsButton = document.getElementById('clearSearchResults');
clearSearchResultsButton.addEventListener('click', clearSearchResults);

const resetGenresButton = document.getElementById('resetGenresButton');

resetGenresButton.addEventListener('click', () => {
    document.querySelectorAll('.genre-button').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('resetGenresButton').classList.add('selected');

    currentPage = 1;
    clearSearchResults(); 

    fetchMovies(); 
});

resetGenresButton.addEventListener('click', () => {
    document.querySelectorAll('.genre-button').forEach(btn => btn.classList.remove('selected'));

    currentPage = 1;
    clearSearchResults(); 

    fetchMovies(); 
});

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
    await fetchMovies();
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

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;

    document.getElementById('toast-container').appendChild(toast);

    // Automatically hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        // Remove the toast after the transition
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}

// Function to save movie to favorites
function saveToFavorites(movie) {
    let favorites = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    
    if (!favorites.some(fav => fav.id === movie.id)) {
        console.log(movie);
        favorites.push({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            poster_path: movie.poster_path,
            genres: movie.genres
        });

        console.log(JSON.stringify(favorites));
        localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
        showToast(`${movie.title} has been added to favorites!`);
    } else {
        showToast(`${movie.title} is already in your favorites.`);
    }
}

// Function to handle button click
document.querySelectorAll('.add-to-favorites').forEach(button => {
    button.addEventListener('click', (event) => {
        const movieId = event.target.getAttribute('data-movie-id');
        const movieTitle = event.target.closest('.movie').querySelector('h2').textContent;
        
        // Create movie object
        const movie = {
            id: movieId,
            title: movieTitle,
            // Add more properties if needed, like overview, release date, etc.
        };

        saveToFavorites(movie);
    });
});

function resetSearchedMovie(){
    document.getElementById('searchedMovie').innerHTML = '';
}

async function fetchWithAuth(url) {
    try{
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
    
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorMessage}`);
        }
    
        return response.json();

    } catch (error) {
        console.error('Error fetching movie data:', error);
        alert('An error occurred while fetching data. Please try again later.');
    }
}

async function fetchGenres() {
    const apiUrl = `https://api.themoviedb.org/3/genre/movie/list`;
    try {
        const data = await fetchWithAuth(apiUrl);
        genreMap = Object.fromEntries(data.genres.map(genre => [genre.id, genre.name]));

        const genreButtonsDiv = document.getElementById('genreButtons');
        data.genres.forEach(genre => {
            const button = document.createElement('button');
            button.textContent = genre.name; // Display genre name
            button.classList.add('genre-button', 'button', 'button-secondary');
            button.setAttribute('data-genre-id', genre.id); // Store genre ID in data attribute
        
            button.addEventListener('click', () => {
                // Remove 'selected' class from all buttons
                document.getElementById('resetGenresButton').classList.remove('selected');
                document.querySelectorAll('.genre-button').forEach(btn => btn.classList.remove('selected'));
                
                // Add 'selected' class to the clicked button
                button.classList.add('selected');
            
                const selectedGenreId = button.getAttribute('data-genre-id');
                currentPage = 1; // Reset to the first page when fetching new movies
                clearSearchResults(); // Clear previous results
                fetchMovies(selectedGenreId, currentPage); // Fetch movies for the selected genre
            });
        
            genreButtonsDiv.appendChild(button); // Append button to the genre buttons div
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

async function fetchMovies(genreId = '', page = 1) {
    const genreQuery = genreId ? `&with_genres=${genreId}` : ''; // Include genre if selected
    const apiUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc${genreQuery}`;

    try {
        const data = await fetchWithAuth(apiUrl);
        renderMovies(data.results); // Render all results
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}



let currentPage = 1; // Track the current page
let totalResults = 0; // Store total results

function fetchNextPage() {
    currentPage++; 
    const selectedGenreId = document.querySelector('.genre-button.selected')?.getAttribute('data-genre-id') || ''; // Get the currently selected genre
    fetchMovies(selectedGenreId, currentPage); // Fetch movies for the current page with genre filter
}

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
    displayingResultLength.innerHTML = `Displaying results: <span class="highlight-text-color">${results.results.length}</span>`;
    totalPagesText.innerHTML = `Total Pages: <span class="highlight-text-color">${results.total_pages}</span>`;
    totalResultsText.innerHTML = `Total Results: <span class="highlight-text-color">${results.total_results}</span>`;

    
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

    // Attach event listeners for "Add to favorites" buttons
    document.querySelectorAll('.add-to-favorites').forEach(button => {
        button.addEventListener('click', (event) => {
            const movieElement = event.target.closest('.movie'); // Get the closest movie element

            // Create movie object with all properties
            const movie = {
                id: event.target.getAttribute('data-movie-id'),
                title: movieElement.querySelector('h2').textContent,
                overview: movieElement.querySelector('p:nth-of-type(1)').textContent.split(': ')[1], // Overview
                release_date: movieElement.querySelector('p:nth-of-type(2)').textContent.split(': ')[1], // Release date
                vote_average: movieElement.querySelector('p:nth-of-type(3)').textContent.split(': ')[1].split(' ')[0], // Vote average
                poster_path: movieElement.querySelector('.img-movie-highlight').src, // Image source
                genres: Array.from(movieElement.querySelectorAll('.genre')).map(genre => genre.textContent) // Extract genres
            };

            console.log('Saving movie:', movie); // Log for debugging

            saveToFavorites(movie); // Call the function to save to localStorage
        });
    });
}

function createMovieHTML(movie) {
    const genresList = movie.genre_ids.map(id => `<span class="genre">${genreMap[id]}</span>`).join('');
    
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
            <button class="button button-primary add-to-favorites" data-movie-id="${movie.id}">Add to favorites</button>
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