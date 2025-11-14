const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const IMAGE_BASE_W500 = "https://image.tmdb.org/t/p/w500";

// Exportamos os elementos para 'main.js' poder adicionar listeners
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
};

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

// --- Funções de UI do Catálogo ---

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
          <span class="meta-chip">${year}</span>
          ${genres
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

// --- Funções de UI de Detalhes ---

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
