document.addEventListener('DOMContentLoaded', () => {
    const favoritesContainer = document.getElementById('favoritesContainer');

    // Function to load favorites from localStorage
    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    
        if (favorites.length === 0) {
            document.getElementById('errorMessage').innerHTML = '<p>No favorite movies found.</p>';
            return;
        }
    
        favorites.forEach(movie => {
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('movie');
            movieDiv.innerHTML = `
                <div class="img-container">
                    <img src="${movie.poster_path ? movie.poster_path : '../img/sad-outline.svg'}" alt="${movie.title}">
                </div>
                <h2>${movie.title} (${movie.release_date.split('-')[0]})</h2>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
                <p><strong>Vote Average:</strong> ${movie.vote_average}</p>
                <p><strong>Genres:</strong> <span class="genres">${Array.isArray(movie.genres) && movie.genres.length > 0 ? movie.genres.map(genre => `<span class="genre">${genre}</span>`).join('') : 'N/A'}</span></p>
                <button class="button button-primary remove-favorite" data-movie-id="${movie.id}">Remove from Favorites</button>
            `;
            favoritesContainer.appendChild(movieDiv);
        });
    
        // Attach event listeners for removing favorites
        attachRemoveListeners();
    }

    // Function to attach event listeners to remove buttons
    function attachRemoveListeners() {
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (event) => {
                const movieId = event.target.getAttribute('data-movie-id');
                removeFromFavorites(movieId);
            });
        });
    }

    // Function to remove a movie from favorites
    function removeFromFavorites(movieId) {
        let favorites = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    
        // Filter out the movie with the given ID
        favorites = favorites.filter(movie => movie.id !== movieId);
    
        // Update localStorage
        localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
    
        // Remove the movie div from the DOM
        const movieDiv = document.querySelector(`.movie [data-movie-id="${movieId}"]`).closest('.movie');
        if (movieDiv) {
            movieDiv.remove();
        }
    }

    // Load favorites on page load
    loadFavorites();

    // Clear all favorites
    document.getElementById('clearFavorites').addEventListener('click', () => {
        localStorage.removeItem('favoriteMovies');
        loadFavorites(); // Reload favorites
    });
});