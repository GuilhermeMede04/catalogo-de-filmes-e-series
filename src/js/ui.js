import { state } from "./state.js";

export const elements = {
  catalogSection: document.querySelector(".catalog-section"),
  catalogGrid: document.getElementById("catalog"),       
  catalogLoader: document.getElementById("catalog-loader"),
  catalogError: document.getElementById("catalog-error"),
  loadMoreBtn: document.getElementById("load-more"),      
  genreSelect: document.getElementById("genre-select"),
  catalogStatus: document.getElementById("catalog-status"),

  detailsSection: document.getElementById("details-section"),
  detailsContainer: document.getElementById("media-details"),
  detailsLoader: document.getElementById("details-loader"),
  detailsError: document.getElementById("details-error"),
  backButton: document.getElementById("back-button"),

  moviesSection: document.getElementById("movies-section"),
  moviesLoader: document.getElementById("movies-loader"),
  moviesError: document.getElementById("movies-error"),
  moviesList: document.getElementById("movies-list"),

  seriesSection: document.getElementById("series-section"),
  seriesLoader: document.getElementById("series-loader"),
  seriesError: document.getElementById("series-error"),
  seriesList: document.getElementById("series-list"),

  aboutSection: document.getElementById("about-section")
};

function escapeHtml(text) {
  if (!text) return "";
  return String(text).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}


export function renderGenreOptions(genreMap) {
  elements.genreSelect.innerHTML = `<option value="">Todos</option>`;
  if (!genreMap || typeof genreMap.forEach !== "function") return;

  genreMap.forEach((name, id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = name;
    elements.genreSelect.appendChild(opt);
  });
}

export function showCatalogLoader() {
  elements.catalogLoader?.classList.remove("hidden");
  elements.catalogError?.classList.add("hidden");
  elements.catalogGrid?.classList.add("hidden");
  if (elements.catalogStatus) elements.catalogStatus.textContent = "";
  if (elements.loadMoreBtn) elements.loadMoreBtn.classList.add("hidden");
}

export function hideCatalogLoader() {
  elements.catalogLoader?.classList.add("hidden");
  elements.catalogGrid?.classList.remove("hidden");
}

export function showCatalogError(message) {
  elements.catalogLoader?.classList.add("hidden");
  elements.catalogGrid?.classList.add("hidden");
  if (elements.catalogError) {
    elements.catalogError.textContent = message;
    elements.catalogError.classList.remove("hidden");
  }
}

export function clearCatalog() {
  if (elements.catalogGrid) elements.catalogGrid.innerHTML = "";
}

export function renderMovies(results, genreMap, onCardClick) {
  if (!elements.catalogGrid) return;
  results.forEach((item) => {
    const card = createCard(item, item.media_type || "movie", genreMap);
    card.addEventListener("click", () => onCardClick(item.id, item.media_type || "movie"));
    elements.catalogGrid.appendChild(card);
  });
}

export function updateCatalogStatus(message) {
  if (elements.catalogStatus) elements.catalogStatus.textContent = message;
}

export function updateLoadMoreButton(loading, hasMore) {
  if (!elements.loadMoreBtn) return;
  if (!hasMore) {
    elements.loadMoreBtn.classList.add("hidden");
    return;
  }
  elements.loadMoreBtn.classList.remove("hidden");
  elements.loadMoreBtn.disabled = loading;
  elements.loadMoreBtn.textContent = loading ? "Carregando..." : "Carregar mais";
}

export function showDetailsLoader() {
  elements.detailsLoader?.classList.remove("hidden");
  elements.detailsContainer?.classList.add("hidden");
}

export function hideDetailsLoader() {
  elements.detailsLoader?.classList.add("hidden");
  elements.detailsContainer?.classList.remove("hidden");
}

export function showDetailsError(message) {
  elements.detailsLoader?.classList.add("hidden");
  if (elements.detailsContainer) elements.detailsContainer.classList.add("hidden");
  if (elements.detailsError) {
    elements.detailsError.textContent = message;
    elements.detailsError.classList.remove("hidden");
  }
}

export function showDetailsPage() {
  elements.catalogSection?.classList.add("hidden");
  elements.moviesSection?.classList.add("hidden");
  elements.seriesSection?.classList.add("hidden");
  elements.aboutSection?.classList.add("hidden");
  elements.detailsSection?.classList.remove("hidden");
  window.scrollTo(0, 0);
}

export function showCatalogPage() {
  elements.detailsSection?.classList.add("hidden");
  elements.moviesSection?.classList.add("hidden");
  elements.seriesSection?.classList.add("hidden");
  elements.aboutSection?.classList.add("hidden");
  elements.catalogSection?.classList.remove("hidden");
}

export function renderMediaDetails(data) {
  const title = data.title || data.name || "Título não disponível";
  const overview = data.overview || "Sinopse não disponível.";
  const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "src/assets/img/no-image.png";
  const year = data.release_date ? new Date(data.release_date).getFullYear() : data.first_air_date ? new Date(data.first_air_date).getFullYear() : "Ano não informado";
  const mediaType = data.media_type === "movie" || data.title ? "Filme" : "Série";

  if (elements.detailsContainer) {
    elements.detailsContainer.innerHTML = `
      <div class="media-header">
        <img class="detail-poster" src="${poster}" alt="${escapeHtml(title)}">
        <div class="media-info">
          <h1>${escapeHtml(title)}</h1>
          <div class="detail-meta"><span>${year}</span><span>${mediaType}</span></div>
          <p class="detail-overview">${escapeHtml(overview)}</p>
        </div>
      </div>
    `;
  }
}

export function showMoviesLoader() {
  elements.moviesError?.classList.add("hidden");
  elements.moviesLoader?.classList.remove("hidden");
  elements.moviesList?.classList.add("hidden");
}

export function hideMoviesLoader() {
  elements.moviesLoader?.classList.add("hidden");
  elements.moviesList?.classList.remove("hidden");
}

export function showMoviesError(message) {
  if (elements.moviesLoader) elements.moviesLoader.classList.add("hidden");
  if (elements.moviesList) elements.moviesList.innerHTML = `<p class="error-msg">${message}</p>`;
  elements.moviesList?.classList.remove("hidden");
}

export function renderMoviesSection(movies) {
  if (!elements.moviesList) return;
  elements.moviesList.innerHTML = "";
  movies.forEach(movie => {
    const card = createCard(movie, "movie");
    elements.moviesList.appendChild(card);
  });
}

export function showSeriesLoader() {
  elements.seriesError?.classList.add("hidden");
  elements.seriesLoader?.classList.remove("hidden");
  elements.seriesList?.classList.add("hidden");
}

export function hideSeriesLoader() {
  elements.seriesLoader?.classList.add("hidden");
  elements.seriesList?.classList.remove("hidden");
}

export function showSeriesError(message) {
  if (elements.seriesLoader) elements.seriesLoader.classList.add("hidden");
  if (elements.seriesList) elements.seriesList.innerHTML = `<p class="error-msg">${message}</p>`;
  elements.seriesList?.classList.remove("hidden");
}

export function renderSeriesSection(series) {
  if (!elements.seriesList) return;
  elements.seriesList.innerHTML = "";
  series.forEach(tv => {
    const card = createCard(tv, "tv");
    elements.seriesList.appendChild(card);
  });
}

function createCard(item, type, genreMap) {
  const poster = item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : "src/assets/img/no-image.png";
  const title = item.title || item.name || "Título não disponível";
  const year = item.release_date ? new Date(item.release_date).getFullYear() : item.first_air_date ? new Date(item.first_air_date).getFullYear() : "";
  const mediaTypeLabel = type === "movie" || item.title ? "Filme" : "Série";

  const card = document.createElement("article");
  card.className = "movie-card";
  card.innerHTML = `
    <img class="movie-poster" src="${poster}" alt="${escapeHtml(title)}">
    <div class="movie-info">
      <h3 class="movie-title">${escapeHtml(title)}</h3>
      <div class="movie-meta">
        <span class="meta-chip">${mediaTypeLabel}</span>
        ${year ? `<span class="meta-chip">${year}</span>` : ""}
      </div>
    </div>
  `;
  return card;
}
