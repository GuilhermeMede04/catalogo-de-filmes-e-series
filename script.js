const API_KEY = '70e5c08fa5e2c8c560ca36e87aa1f913';
const API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

const catalogEl = document.getElementById('catalog');
const statusEl = document.getElementById('catalog-status');
const loadMoreBtn = document.getElementById('load-more');
const genreSelect = document.getElementById('genre-select');

let currentPage = 1;
let totalPages = 1;
let selectedGenre = '';

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[ch]);
}

async function fetchGenres() {
    const res = await fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`);
    if (!res.ok) throw new Error('Erro ao carregar gêneros');
    const data = await res.json();
    return new Map(data.genres.map(g => [g.id, g.name]));
}

// Busca filmes de 2025
async function fetchMovies(page = 1, genre = '') {
    const url = `${API_BASE}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_year=2025&include_adult=false&page=${page}${genre ? `&with_genres=${genre}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao carregar filmes');
    return await res.json();
}

function clearCatalog() {
    catalogEl.innerHTML = '';
}

function renderMovies(movies, genreMap) {
    movies.forEach(movie => {
        const poster = movie.poster_path 
            ? `${IMAGE_BASE}${movie.poster_path}` 
            : 'assets/poster-placeholder.png';
        
        const year = movie.release_date 
            ? new Date(movie.release_date).getFullYear() 
            : '2025';
        
        const genres = (movie.genre_ids || [])
            .map(id => genreMap.get(id))
            .filter(Boolean)
            .slice(0, 3);

        const card = document.createElement('article');
        card.className = 'movie-card';
        card.innerHTML = `
            <img class="movie-poster" src="${poster}" alt="${escapeHtml(movie.title)}">
            <div class="movie-info">
                <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
                <div class="movie-meta">
                    <span class="meta-chip">Filme</span>
                    <span class="meta-chip">${year}</span>
                    ${genres.map(g => `<span class="meta-chip">${escapeHtml(g)}</span>`).join('')}
                </div>
            </div>
        `;
        catalogEl.appendChild(card);
    });
}

async function init() {
    try {
        statusEl.textContent = 'Carregando gêneros...';
        const genreMap = await fetchGenres();

        genreMap.forEach((name, id) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            genreSelect.appendChild(option);
        });

        statusEl.textContent = 'Buscando filmes de 2025...';
        const data = await fetchMovies(currentPage, selectedGenre);

        clearCatalog();
        if (data.results && data.results.length) {
            renderMovies(data.results, genreMap);
            totalPages = data.total_pages; // Atualiza total de páginas
            statusEl.textContent = `Exibindo ${data.results.length} filmes de 2025 (página ${currentPage} de ${totalPages}).`;
        } else {
            statusEl.textContent = 'Nenhum filme encontrado para 2025.';
        }
    } catch (err) {
        console.error(err);
        statusEl.textContent = 'Erro ao carregar dados. Veja o console.';
    }
}

async function loadMoreMovies() {
    if (currentPage < totalPages) {
        currentPage++;
        const genreMap = await fetchGenres();
        const data = await fetchMovies(currentPage, selectedGenre);
        renderMovies(data.results, genreMap);
        statusEl.textContent = `Exibindo mais filmes (página ${currentPage} de ${totalPages}).`;
    } else {
        statusEl.textContent = 'Não há mais filmes para carregar.';
        loadMoreBtn.style.display = 'none';
    }
}

loadMoreBtn.addEventListener('click', loadMoreMovies);

genreSelect.addEventListener('change', async (event) => {
    selectedGenre = event.target.value;
    currentPage = 1;
    const genreMap = await fetchGenres();
    const data = await fetchMovies(currentPage, selectedGenre);
    clearCatalog();
    if (data.results && data.results.length) {
        renderMovies(data.results, genreMap);
        totalPages = data.total_pages;
        statusEl.textContent = `Exibindo ${data.results.length} filmes de 2025 (página ${currentPage} de ${totalPages}).`;
    } else {
        statusEl.textContent = 'Nenhum filme encontrado para 2025.';
    }
});

document.addEventListener('DOMContentLoaded', init);