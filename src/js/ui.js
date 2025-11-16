const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const IMAGE_BASE_W500 = "https://image.tmdb.org/t/p/w500";

// Elementos dom para a manipulacao
export const elements = {
  catalogEl: document.getElementById("catalog"),
  statusEl: document.getElementById("catalog-status"),
  loadMoreBtn: document.getElementById("load-more"),
  genreSelect: document.getElementById("genre-select"),
  catalogLoader: document.getElementById("catalog-loader"),
  catalogError: document.getElementById("catalog-error"),

  detailsSection: document.getElementById("details-section"),
  backButton: document.getElementById("back-button"),
  mediaDetails: document.getElementById("media-details"),
  detailsLoader: document.getElementById("details-loader"),
  detailsError: document.getElementById("details-error"),
  catalogSection: document.querySelector(".catalog-section"),

  detailsPopularLoader: document.getElementById("details-popular-loader"),
  detailsPopularError: document.getElementById("details-popular-error"),
  detailsPopularList: document.getElementById("details-popular-list"),

  moviesSection: document.getElementById("movies-section"),
  moviesLoader: document.getElementById("movies-loader"),
  moviesError: document.getElementById("movies-error"),
  moviesList: document.getElementById("movies-list"),
  loadMoreMoviesBtn: document.getElementById("load-more-movies"),

  seriesSection: document.getElementById("series-section"),
  seriesLoader: document.getElementById("series-loader"),
  seriesError: document.getElementById("series-error"),
  seriesList: document.getElementById("series-list"),
  loadMoreSeriesBtn: document.getElementById("load-more-series"),

  aboutSection: document.getElementById("about-section"),
};
function escapeHtml(text) {
  if (!text) return "";
  return String(text).replace(
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

//Funcoes de UI do catalago
export function showCatalogLoader() {
  elements.catalogLoader.classList.remove("hidden");
  elements.catalogError.classList.add("hidden");
  elements.catalogError.textContent = "";
  elements.catalogEl.classList.add("hidden");
  elements.statusEl.textContent = "";
  elements.loadMoreBtn.classList.add("hidden");
}

export function hideCatalogLoader() {
  elements.catalogLoader.classList.add("hidden");
  elements.catalogEl.classList.remove("hidden");
}

export function showCatalogError(message) {
  elements.catalogLoader.classList.add("hidden");
  elements.catalogEl.classList.add("hidden");
  elements.catalogError.textContent = message;
  elements.catalogError.classList.remove("hidden");
  elements.statusEl.textContent = "";
  elements.loadMoreBtn.classList.add("hidden");
}

export function clearCatalog() {
  elements.catalogEl.innerHTML = "";
}
export function renderGenreOptions(genreMap) {
  genreMap.forEach((name, id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    elements.genreSelect.appendChild(option);
  });
}

//Renderiza lista de filmes e series no catalogo
export function renderMovies(media, genreMap, onCardClick) {
  const fragment = document.createDocumentFragment();

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
    <img class="movie-poster" src="${poster}" alt="${escapeHtml(title)}">
    <div class="movie-info">
    <h3 class="movie-title">${escapeHtml(title)}</h3>
    <div class="movie-meta">
    <span class="meta-chip">${
      item.media_type === "movie" ? "Filme" : "Série"
    }</span>
    <span class="meta-chip">${year}</span>${genres
      .map((g) => `<span class="meta-chip">${escapeHtml(g)}</span>`)
      .join("")}
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      onCardClick(item.id, item.media_type);
    });

    fragment.appendChild(card);
  });

  elements.catalogEl.appendChild(fragment);
}

export function updateCatalogStatus(message) {
  elements.statusEl.textContent = message;
}

export function updateLoadMoreButton(loading, hasMore) {
  elements.loadMoreBtn.disabled = loading;
  elements.loadMoreBtn.textContent = loading
    ? "Carregando..."
    : "Carregar mais";
  elements.loadMoreBtn.classList.toggle("hidden", !hasMore);
}

// --- FUNÇÕES ADICIONADAS PARA NOVOS BOTÕES ---

export function updateLoadMoreMoviesButton(loading = false, hasMore = true) {
  if (!elements.loadMoreMoviesBtn) return;
  elements.loadMoreMoviesBtn.disabled = loading;
  elements.loadMoreMoviesBtn.textContent = loading
    ? "Carregando..."
    : "Carregar mais";
  elements.loadMoreMoviesBtn.classList.toggle("hidden", !hasMore);
}

export function updateLoadMoreSeriesButton(loading = false, hasMore = true) {
  if (!elements.loadMoreSeriesBtn) return;
  elements.loadMoreSeriesBtn.disabled = loading;
  elements.loadMoreSeriesBtn.textContent = loading
    ? "Carregando..."
    : "Carregar mais";
  elements.loadMoreSeriesBtn.classList.toggle("hidden", !hasMore);
}

// --- FIM DAS FUNÇÕES ADICIONADAS ---

//Funcoes de UI de detalhes
export function showDetailsLoader() {
  elements.detailsLoader.classList.remove("hidden");
  elements.detailsError.classList.add("hidden");
  elements.detailsError.textContent = "";
  elements.mediaDetails.classList.add("hidden");
}

export function hideDetailsLoader() {
  elements.detailsLoader.classList.add("hidden");
  elements.mediaDetails.classList.remove("hidden");
}

export function showDetailsError(message) {
  elements.detailsLoader.classList.add("hidden");
  elements.mediaDetails.classList.add("hidden");
  elements.detailsError.textContent = message;
  elements.detailsError.classList.remove("hidden");
}

export function showDetailsPage() {
  elements.catalogSection.classList.add("hidden");
  elements.detailsSection.classList.remove("hidden");
  window.scrollTo(0, 0);
}

export function showCatalogPage() {
  elements.catalogSection.classList.remove("hidden");
  elements.detailsSection.classList.add("hidden");
}
//Renderiza pagina de detalhes
export function renderMediaDetails(data) {
  const title = data.title || data.name || "Título não disponível";
  const overview = data.overview || "Sinopse não disponível para este título.";
  const rating = data.vote_average
    ? `${data.vote_average.toFixed(1)}/10`
    : "Não avaliado";
  const poster = data.poster_path
    ? `${IMAGE_BASE_W500}${data.poster_path}`
    : "https://placehold.co/300x450/333/fff?text=Sem+Imagem";
  const year = data.release_date
    ? new Date(data.release_date).getFullYear()
    : data.first_air_date
    ? new Date(data.first_air_date).getFullYear()
    : "Ano não informado";
  const mediaType = data.media_type === "movie" ? "Filme" : "Série";

  let html = `
    <div class="media-header">
      <img class="detail-poster" src="${poster}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x450/333/fff?text=Imagem+Não+Carregou'">
      <div class="media-info">
        <h1 class="detail-title">${title}</h1>
        <div class="detail-rating">⭐ ${rating}</div>
        <div class="detail-meta">
          <span>${year}</span>
          <span>${mediaType}</span>
        </div>
        <p class="detail-overview texto-limitado">${overview}</p>
      </div>
    </div>
  `;
  if (data.seasons) {
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
              <h4>${season.name || `Temporada ${season.season_number}`}</h4>
              <span>${season.episode_count || 0} episódios</span>
            </div>
            <p class="season-overview texto-limitado">${seasonOverview}</p>
          </div>
        `;
      });
    }
    html += "</div>";
  }

  elements.mediaDetails.innerHTML = html;
}
//Controle da secao de filmes
export function showMoviesLoader() {
  elements.moviesError.classList.add("hidden");
  elements.moviesLoader.classList.remove("hidden");
  elements.moviesList.classList.add("hidden");
}

export function hideMoviesLoader() {
  elements.moviesLoader.classList.add("hidden");
  elements.moviesList.classList.remove("hidden");
}

export function showMoviesError(message) {
  elements.moviesLoader.classList.add("hidden");
  elements.moviesList.innerHTML = `<p class="error-msg">${message}</p>`;
  elements.moviesList.classList.remove("hidden");
}

//Função para limpar a lista de filmes
export function clearMoviesList() {
  if (elements.moviesList) {
    elements.moviesList.innerHTML = "";
  }
}

export function renderMoviesSection(movies, onCardClick) {
  movies.forEach((movie) => {
    const card = createCard(movie, "movie");
    card.addEventListener("click", () => onCardClick(movie.id, "movie"));
    elements.moviesList.appendChild(card);
  });
}

//Controle da secao de series
export function showSeriesLoader() {
  elements.seriesError.classList.add("hidden");
  elements.seriesLoader.classList.remove("hidden");
  elements.seriesList.classList.add("hidden");
}

export function hideSeriesLoader() {
  elements.seriesLoader.classList.add("hidden");
  elements.seriesList.classList.remove("hidden");
}

export function showSeriesError(message) {
  elements.seriesLoader.classList.add("hidden");
  elements.seriesList.innerHTML = `<p class="error-msg">${message}</p>`;
  elements.seriesList.classList.remove("hidden");
}

// Função para limpar a lista de séries
export function clearSeriesList() {
  if (elements.seriesList) {
    elements.seriesList.innerHTML = "";
  }
}

export function renderSeriesSection(series, onCardClick) {
  series.forEach((tv) => {
    const card = createCard(tv, "tv");
    card.addEventListener("click", () => onCardClick(tv.id, "tv"));
    elements.seriesList.appendChild(card);
  });
}
//Navegacao entre paginas
export function showMoviesPage() {
  elements.detailsSection.classList.add("hidden");
  elements.catalogSection.classList.add("hidden");
  elements.seriesSection.classList.add("hidden");
  elements.aboutSection.classList.add("hidden");
  elements.moviesSection.classList.remove("hidden");
}

export function showSeriesPage() {
  elements.detailsSection.classList.add("hidden");
  elements.catalogSection.classList.add("hidden");
  elements.moviesSection.classList.add("hidden");
  elements.aboutSection.classList.add("hidden");
  elements.seriesSection.classList.remove("hidden");
}

export function showAboutPage() {
  elements.detailsSection.classList.add("hidden");
  elements.catalogSection.classList.add("hidden");
  elements.moviesSection.classList.add("hidden");
  elements.seriesSection.classList.add("hidden");
  elements.aboutSection.classList.remove("hidden");
}

// Criar card de filme e serie
function createCard(item, type) {
  const poster = item.poster_path
    ? `${IMAGE_BASE}${item.poster_path}`
    : "https://placehold.co/300x450/333/fff?text=Sem+Imagem";
  const year = item.release_date
    ? new Date(item.release_date).getFullYear()
    : item.first_air_date
    ? new Date(item.first_air_date).getFullYear()
    : "2025";
  const title = item.title || item.name || "Título não disponível";
  const mediaTypeLabel = type === "movie" ? "Filme" : "Série";

  const card = document.createElement("article");
  card.className = "movie-card";
  card.innerHTML = `
    <img class="movie-poster" src="${poster}" alt="${escapeHtml(title)}">
    <div class="movie-info">
      <h3 class="movie-title">${escapeHtml(title)}</h3>
      <div class="movie-meta">
        <span class="meta-chip">${mediaTypeLabel}</span>
        <span class="meta-chip">${year}</span>
      </div>
    </div>
  `;

  return card;
}

// Controle das recomendacoes nos detalhes
export function showDetailsPopularLoader() {
  elements.detailsPopularError.classList.add("hidden");
  elements.detailsPopularLoader.classList.remove("hidden");
  elements.detailsPopularList.classList.add("hidden");
}

export function hideDetailsPopularLoader() {
  elements.detailsPopularLoader.classList.add("hidden");
  elements.detailsPopularList.classList.remove("hidden");
}

export function showDetailsPopularError(message) {
  elements.detailsPopularLoader.classList.add("hidden");
  elements.detailsPopularList.innerHTML = `<p class="error-msg">${message}</p>`;
  elements.detailsPopularList.classList.remove("hidden");
}
// Renderiza recomendacoes na pagina de detalhes
export function renderDetailsPopularMovies(
  items,
  onCardClick,
  title = "Recomendações"
) {
  const titleElement = document.getElementById("details-popular-title");
  if (titleElement) {
    titleElement.textContent = title;
  }

  elements.detailsPopularList.innerHTML = "";

  if (!items || items.length === 0) {
    elements.detailsPopularList.innerHTML =
      "<p>Nenhuma recomendação encontrada.</p>";
    return;
  }

  items.forEach((item) => {
    const mediaType = item.media_type || (item.title ? "movie" : "tv");
    const card = createCard(item, mediaType);
    card.addEventListener("click", () => onCardClick(item.id, mediaType));
    elements.detailsPopularList.appendChild(card);
  });
}
