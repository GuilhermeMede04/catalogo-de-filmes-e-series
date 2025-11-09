const API_KEY = '70e5c08fa5e2c8c560ca36e87aa1f913';
const API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

const catalogEl = document.getElementById('catalog');
const statusEl = document.getElementById('catalog-status');

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

async function fetchMovies(page = 1) {
    const url = `${API_BASE}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_year=2025&include_adult=false&page=${page}`;
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

        statusEl.textContent = 'Buscando filmes de 2025...';
        const data = await fetchMovies(1);

        clearCatalog();
        if (data.results && data.results.length) {
            renderMovies(data.results, genreMap);
            statusEl.textContent = `Exibindo ${data.results.length} filmes de 2025 (página 1 de ${data.total_pages}).`;
        } else {
            statusEl.textContent = 'Nenhum filme encontrado para 2025.';
        }
    } catch (err) {
        console.error(err);
        statusEl.textContent = 'Erro ao carregar dados. Veja o console.';
    }
}

document.addEventListener('DOMContentLoaded', init);