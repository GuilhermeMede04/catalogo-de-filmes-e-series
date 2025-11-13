const API_KEY = "70e5c08fa5e2c8c560ca36e87aa1f913";
const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

// --- Elementos DOM do Catálogo ---
const catalogEl = document.getElementById("catalog");
const statusEl = document.getElementById("catalog-status");
const loadMoreBtn = document.getElementById("load-more");
const genreSelect = document.getElementById("genre-select");
// TAREFA 8 e 9: Novos elementos do Catálogo
const catalogLoader = document.getElementById("catalog-loader");
const catalogError = document.getElementById("catalog-error");

// --- Elementos DOM dos Detalhes ---
const detailsSection = document.getElementById("details-section");
const backButton = document.getElementById("back-button");
const mediaDetails = document.getElementById("media-details");
// TAREFA 8 e 9: Novos elementos dos Detalhes
const detailsLoader = document.getElementById("details-loader");
const detailsError = document.getElementById("details-error");

// --- Estado Global ---
let currentPage = 1;
let totalPages = 1;
let selectedGenre = "";
let genreMap = new Map();

// --- TAREFA 8 & 9: Funções de Controle de UI (Catálogo) ---

function showCatalogLoader() {
  catalogLoader.classList.remove("hidden");
  catalogError.classList.add("hidden");
  catalogError.textContent = "";
  catalogEl.classList.add("hidden");
  statusEl.textContent = "";
  loadMoreBtn.classList.add("hidden");
}

function hideCatalogLoader() {
  catalogLoader.classList.add("hidden");
  catalogEl.classList.remove("hidden");
}

function showCatalogError(message) {
  catalogLoader.classList.add("hidden");
  catalogEl.classList.add("hidden");
  catalogError.textContent = message;
  catalogError.classList.remove("hidden");
  statusEl.textContent = "";
  loadMoreBtn.classList.add("hidden");
}

// --- TAREFA 8 & 9: Funções de Controle de UI (Detalhes) ---

function showDetailsLoader() {
  detailsLoader.classList.remove("hidden");
  detailsError.classList.add("hidden");
  detailsError.textContent = "";
  mediaDetails.classList.add("hidden");
}

function hideDetailsLoader() {
  detailsLoader.classList.add("hidden");
  mediaDetails.classList.remove("hidden");
}

function showDetailsError(message) {
  detailsLoader.classList.add("hidden");
  mediaDetails.classList.add("hidden");
  detailsError.textContent = message;
  detailsError.classList.remove("hidden");
}

// --- Funções Auxiliares ---

function escapeHtml(text) {
  if (!text) return "";
  return text.replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch])
  );
}

// --- Funções de API ---

async function fetchGenres() {
  const movieRes = await fetch(
    `${API_BASE}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`
  );
  const tvRes = await fetch(
    `${API_BASE}/genre/tv/list?api_key=${API_KEY}&language=pt-BR`
  );
  if (!movieRes.ok || !tvRes.ok) throw new Error("Erro ao carregar gêneros");
  const movieData = await movieRes.json();
  const tvData = await tvRes.json();
  const allGenres = [...movieData.genres, ...tvData.genres];
  const uniqueGenres = Array.from(
    new Map(allGenres.map((g) => [g.id, g])).values()
  );
  return new Map(uniqueGenres.map((g) => [g.id, g.name]));
}

async function fetchMedia(page = 1, genre = "") {
  const moviesUrl = `${API_BASE}/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&primary_release_year=2025&include_adult=false&page=${page}${
    genre ? `&with_genres=${genre}` : ""
  }`;
  const seriesUrl = `${API_BASE}/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&first_air_date_year=2025&include_adult=false&page=${page}${
    genre ? `&with_genres=${genre}` : ""
  }`;

  const [moviesRes, seriesRes] = await Promise.all([
    fetch(moviesUrl),
    fetch(seriesUrl),
  ]);

  if (!moviesRes.ok || !seriesRes.ok) throw new Error("Erro ao carregar dados");

  const moviesData = await moviesRes.json();
  const seriesData = await seriesRes.json();

  const combinedResults = [
    ...moviesData.results.map((item) => ({ ...item, media_type: "movie" })),
    ...seriesData.results.map((item) => ({ ...item, media_type: "tv" })),
  ];

  return {
    results: combinedResults,
    total_pages: Math.max(moviesData.total_pages, seriesData.total_pages),
  };
}

// --- Funções de Renderização e UI ---

function clearCatalog() {
  catalogEl.innerHTML = "";
}

function renderMovies(media) {
  media.forEach((item) => {
    const poster = item.poster_path
      ? `${IMAGE_BASE}${item.poster_path}`
      : "https://placehold.co/300x450/333/fff?text=Sem+Imagem";
    const year = item.release_date
      ? new Date(item.release_date).getFullYear()
      : item.first_air_date
      ? new Date(item.first_air_date).getFullYear()
      : "2025";
    const title = item.title || item.name || "Título não disponível";
    const genres = (item.genre_ids || [])
      .map((id) => genreMap.get(id))
      .filter(Boolean)
      .slice(0, 3);

    const card = document.createElement("article");
    card.className = "movie-card";
    card.innerHTML = `
            <img class="movie-poster" src="${poster}" alt="${escapeHtml(
      title
    )}">
            <div class="movie-info">
                <h3 class="movie-title">${escapeHtml(title)}</h3>
                <div class="movie-meta">
                    <span class="meta-chip">${
      item.media_type === "movie" ? "Filme" : "Série"
    }</span>
                    <span class="meta-chip">${year}</span>
                    ${genres
      .map((g) => `<span class="meta-chip">${escapeHtml(g)}</span>`)
      .join("")}
                </div>
            </div>
        `;
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      showMediaDetails(item.id, item.media_type);
    });
    catalogEl.appendChild(card);
  });
}

// --- Funções de Página (Detalhes) ---

function showMediaDetails(mediaId, mediaType) {
  document.querySelector(".catalog-section").classList.add("hidden");
  detailsSection.classList.remove("hidden");
  loadMediaDetails(mediaId, mediaType);
  window.scrollTo(0, 0);
}

function showCatalog() {
  document.querySelector(".catalog-section").classList.remove("hidden");
  detailsSection.classList.add("hidden");
}

backButton.addEventListener("click", showCatalog);

async function loadMediaDetails(mediaId, mediaType) {
  try {
    showDetailsLoader();

    const endpoint = mediaType === "movie" ? "movie" : "tv";
    const response = await fetch(
      `${API_BASE}/${endpoint}/${mediaId}?api_key=${API_KEY}&language=pt-BR`
    );
    if (!response.ok) {
      if (response.status === 404) throw new Error("Item não encontrado.");
      throw new Error("Não foi possível carregar os detalhes.");
    }
    const data = await response.json();

    const title = data.title || data.name || "Título não disponível";
    const overview =
      data.overview || "Sinopse não disponível para este título.";
    const rating = data.vote_average
      ? `${data.vote_average.toFixed(1)}/10`
      : "Não avaliado";
    const poster = data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : "https://placehold.co/300x450/333/fff?text=Sem+Imagem";
    const year = data.release_date
      ? new Date(data.release_date).getFullYear()
      : data.first_air_date
      ? new Date(data.first_air_date).getFullYear()
      : "Ano não informado";

    let html = `
            <div class="media-header">
                <img class="detail-poster" src="${poster}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x450/333/fff?text=Imagem+Não+Carregou'">
                <div class="media-info">
                    <h1 class="detail-title">${title}</h1>
                    <div class="detail-rating">⭐ ${rating}</div>
                    <div class="detail-meta">
                        <span>${year}</span>
                        <span>${
      mediaType === "movie" ? "Filme" : "Série"
    }</span>
                    </div>
                    <p class="detail-overview texto-limitado">${overview}</p>
                </div>
            </div>
        `;

    if (mediaType === "tv") {
      html += '<div class="seasons-section"><h3>Temporadas</h3>';
      if (!data.seasons || data.seasons.length === 0) {
        html += '<div class="no-data">Nenhuma temporada disponível</div>';
      } else {
        data.seasons.forEach((season) => {
          const seasonOverview =
            season.overview || "Sem descrição para esta temporada.";
          html += `
                        <div class="season-item">
                            <div class="season-header">
                                <h4>${
            season.name || `Temporada ${season.season_number}`
          }</h4>
                                <span>${
            season.episode_count || 0
          } episódios</span>
                            </div>
                             <p class="season-overview texto-limitado">${seasonOverview}</p>
                        </div>
                    `;
        });
      }
      html += "</div>";
    }

    mediaDetails.innerHTML = html;
    hideDetailsLoader();
  } catch (error) {
    console.error(error);
    let msg = "Erro ao carregar detalhes. Tente novamente.";
    if (error.message === "Item não encontrado.") {
      msg = "Item não encontrado em nossa base de dados.";
    }
    showDetailsError(msg);
  }
}

// --- Funções Principais e Eventos ---

async function init() {
  try {
    showCatalogLoader();
    genreMap = await fetchGenres();

    genreMap.forEach((name, id) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name;
      genreSelect.appendChild(option);
    });

    const data = await fetchMedia(currentPage, selectedGenre);

    clearCatalog();
    hideCatalogLoader();

    if (data.results && data.results.length) {
      renderMovies(data.results);
      totalPages = data.total_pages;
      statusEl.textContent = `Exibindo ${data.results.length} itens de 2025.`;
      loadMoreBtn.classList.remove("hidden");
    } else {
      statusEl.textContent = "Nenhum filme ou série encontrado para 2025.";
      loadMoreBtn.classList.add("hidden");
    }
  } catch (err) {
    console.error(err);
    showCatalogError("Ops! Algo deu errado. Tente atualizar a página.");
  }
}

async function loadMoreMovies() {
  if (currentPage >= totalPages) {
    statusEl.textContent = "Não há mais itens para carregar.";
    loadMoreBtn.classList.add("hidden");
    return;
  }

  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Carregando...";

  try {
    currentPage++;
    const data = await fetchMedia(currentPage, selectedGenre);
    if (data.results && data.results.length) {
      renderMovies(data.results);
      statusEl.textContent = `Exibindo mais itens...`;
    }

    if (currentPage >= totalPages) {
      loadMoreBtn.classList.add("hidden");
      statusEl.textContent = "Fim dos resultados.";
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Erro ao carregar mais itens.";
    currentPage--;
  } finally {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "Carregar mais";
  }
}

loadMoreBtn.addEventListener("click", loadMoreMovies);

genreSelect.addEventListener("change", async (event) => {
  selectedGenre = event.target.value;
  currentPage = 1;
  try {
    showCatalogLoader();
    const data = await fetchMedia(currentPage, selectedGenre);
    clearCatalog();
    hideCatalogLoader();
    if (data.results && data.results.length) {
      renderMovies(data.results);
      totalPages = data.total_pages;
      statusEl.textContent = `Exibindo ${data.results.length} itens.`;
      loadMoreBtn.classList.remove("hidden");
    } else {
      statusEl.textContent = "Nenhum item encontrado para este gênero.";
      loadMoreBtn.classList.add("hidden");
    }
  } catch (err) {
    console.error(err);
    showCatalogError("Erro ao filtrar. Tente novamente.");
  }
});

document.addEventListener("DOMContentLoaded", init);
