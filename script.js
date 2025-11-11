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
    const movieRes = await fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`);
    const tvRes = await fetch(`${API_BASE}/genre/tv/list?api_key=${API_KEY}&language=pt-BR`);
    
    if (!movieRes.ok || !tvRes.ok) throw new Error('Erro ao carregar gêneros');
    
    const movieData = await movieRes.json();
    const tvData = await tvRes.json();
    
    const allGenres = [...movieData.genres, ...tvData.genres];
    const uniqueGenres = Array.from(new Map(allGenres.map(g => [g.id, g])).values());
    
    return new Map(uniqueGenres.map(g => [g.id, g.name]));
}

// busca filmes e series de 2025
async function fetchMedia(page = 1, genre = '') {
    // buscar filmes de 2025
    const moviesUrl = `${API_BASE}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_year=2025&include_adult=false&page=${page}${genre ? `&with_genres=${genre}` : ''}`;
    
    // buscar series de 2025  
    const seriesUrl = `${API_BASE}/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&first_air_date_year=2025&include_adult=false&page=${page}${genre ? `&with_genres=${genre}` : ''}`;

    try {
        const [moviesRes, seriesRes] = await Promise.all([
            fetch(moviesUrl),
            fetch(seriesUrl)
        ]);

        if (!moviesRes.ok || !seriesRes.ok) throw new Error('Erro ao carregar dados');

        const moviesData = await moviesRes.json();
        const seriesData = await seriesRes.json();

        const combinedResults = [
            ...moviesData.results.map(item => ({ ...item, media_type: 'movie' })),
            ...seriesData.results.map(item => ({ ...item, media_type: 'tv' }))
        ];

        return {
            results: combinedResults,
            total_pages: Math.max(moviesData.total_pages, seriesData.total_pages)
        };
    } catch (error) {
        throw new Error('Erro ao carregar filmes e séries');
    }
}

function clearCatalog() {
    catalogEl.innerHTML = '';
}

function renderMovies(media, genreMap) {
    media.forEach(item => {
        const poster = item.poster_path 
            ? `${IMAGE_BASE}${item.poster_path}` 
            : 'https://placehold.co/300x450/333/fff?text=Sem+Imagem';
        
        const year = item.release_date 
            ? new Date(item.release_date).getFullYear() 
            : item.first_air_date 
            ? new Date(item.first_air_date).getFullYear()
            : '2025';
        
        const title = item.title || item.name || 'Título não disponível';
        
        const genres = (item.genre_ids || [])
            .map(id => genreMap.get(id))
            .filter(Boolean)
            .slice(0, 3);

        const card = document.createElement('article');
        card.className = 'movie-card';
        card.innerHTML = `
            <img class="movie-poster" src="${poster}" alt="${escapeHtml(title)}">
            <div class="movie-info">
                <h3 class="movie-title">${escapeHtml(title)}</h3>
                <div class="movie-meta">
                    <span class="meta-chip">${item.media_type === 'movie' ? 'Filme' : 'Série'}</span>
                    <span class="meta-chip">${year}</span>
                    ${genres.map(g => `<span class="meta-chip">${escapeHtml(g)}</span>`).join('')}
                </div>
            </div>
        `;
        // para a pagina de detalhes
         card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            showMediaDetails(item.id, item.media_type);
        });
        
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

        statusEl.textContent = 'Buscando filmes e séries de 2025...';
        const data = await fetchMedia(currentPage, selectedGenre);

        clearCatalog();
        if (data.results && data.results.length) {
            renderMovies(data.results, genreMap);
            totalPages = data.total_pages;
            statusEl.textContent = `Exibindo ${data.results.length} itens de 2025 (página ${currentPage} de ${totalPages}).`;
        } else {
            statusEl.textContent = 'Nenhum filme ou série encontrado para 2025.';
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
        const data = await fetchMedia(currentPage, selectedGenre);
        renderMovies(data.results, genreMap);
        statusEl.textContent = `Exibindo mais itens (página ${currentPage} de ${totalPages}).`;
    } else {
        statusEl.textContent = 'Não há mais itens para carregar.';
        loadMoreBtn.style.display = 'none';
    }
}

loadMoreBtn.addEventListener('click', loadMoreMovies);

genreSelect.addEventListener('change', async (event) => {
    selectedGenre = event.target.value;
    currentPage = 1;
    const genreMap = await fetchGenres();
    const data = await fetchMedia(currentPage, selectedGenre);
    clearCatalog();
    if (data.results && data.results.length) {
        renderMovies(data.results, genreMap);
        totalPages = data.total_pages;
        statusEl.textContent = `Exibindo ${data.results.length} itens de 2025 (página ${currentPage} de ${totalPages}).`;
    } else {
        statusEl.textContent = 'Nenhum filme ou série encontrado para 2025.';
    }
});

document.addEventListener('DOMContentLoaded', init);

// selecao dos elementos dom da secao
const detailsSection = document.getElementById('details-section');
const backButton = document.getElementById('back-button');
const mediaDetails = document.getElementById('media-details');
//funcao para mostrar a tela
function showMediaDetails(mediaId, mediaType) {
    //esconde o catalogo e mostra os detalhes
    document.querySelector('.catalog-section').classList.add('hidden');
    detailsSection.classList.remove('hidden');
    //carrega os dados
    loadMediaDetails(mediaId, mediaType);
}

// funcao para voltar a tela de catalogo
function showCatalog() {
    document.querySelector('.catalog-section').classList.remove('hidden');
    detailsSection.classList.add('hidden');
}
// adiciona evento clique no botao de voltar
backButton.addEventListener('click', showCatalog);
//funcao que carrega todos os dados dos filmes e series
async function loadMediaDetails(mediaId, mediaType) {
    try {
        // estado de carregamento
        mediaDetails.innerHTML = '<div class="loading-details"><p>Carregando detalhes...</p></div>';

        //define endpoint baseado no tipo
        const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
        // requisicao para a api
        const response = await fetch(`${API_BASE}/${endpoint}/${mediaId}?api_key=${API_KEY}&language=pt-BR`);
        
        if (!response.ok) throw new Error('Erro ao carregar detalhes');
        
        const data = await response.json();

        // tratamento de dados ausentes
        const title = data.title || data.name || 'Título não disponível';
        const overview = data.overview || 'Sinopse não disponível para este título.';
        const rating = data.vote_average ? `${data.vote_average.toFixed(1)}/10` : 'Não avaliado';
        const poster = data.poster_path 
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : 'https://placehold.co/300x450/333/fff?text=Sem+Imagem';
        const year = data.release_date 
        ? new Date(data.release_date).getFullYear()
        : data.first_air_date
        ? new Date(data.first_air_date).getFullYear()
        : 'Ano não informado';

        // monta html completo de forma dinamica
        let html = `
            <div class="media-header">
                <img class="detail-poster" src="${poster}" alt="${title}"onerror="this.src='https://via.placeholder.com/300x450/333/fff?text=Imagem+Não+Carregou'">
                <div class="media-info">
                    <h1 class="detail-title">${title}</h1>
                    <div class="detail-rating">⭐ ${rating}</div>
                    <div class="detail-meta">
                        <span>${year}</span>
                        <span>${mediaType === 'movie' ? 'Filme' : 'Série'}</span>
                    </div>
                    <p class="detail-overview">${overview}</p>
                </div>
            </div>
        `;

        // tratamento para series
        if (mediaType === 'tv') {
            html += '<div class="seasons-section"><h3>Temporadas</h3>';
            
            if (!data.seasons || data.seasons.length === 0) {
                html += '<div class="no-data">Nenhuma temporada disponível</div>';
            } else {
                data.seasons.forEach(season => {
                    html += `
                        <div class="season-item">
                            <div class="season-header">
                                <h4>${season.name || `Temporada ${season.season_number}`}</h4>
                                <span>${season.episode_count || 0} episódios</span>
                            </div>
                        </div>
                    `;
                });
            }
            html += '</div>';
        }

        mediaDetails.innerHTML = html;

    }
    // tratamento de erro
    catch (error) {
        mediaDetails.innerHTML = `
            <div class="error-message">
                <p>Erro ao carregar detalhes: ${error.message}</p>
                <button onclick="showCatalog()" class="back-button">Voltar ao Catálogo</button>
            </div>
        `;
    }
}