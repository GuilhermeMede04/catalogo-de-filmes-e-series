import { state } from "./state.js";
import * as api from "./api.js";
import * as ui from "./ui.js";

// --- Variáveis das Seções ---
const catalogSection = document.querySelector(".catalog-section");
const detailsSection = document.getElementById("details-section");
const aboutSection = document.getElementById("about-section");
const moviesSection = document.getElementById("movies-section");
const seriesSection = document.getElementById("series-section");

// --- Estado local para paginação das seções ---
let moviesCurrentPage = 1;
let moviesTotalPages = 1;
let seriesCurrentPage = 1;
let seriesTotalPages = 1;

// --- Funções de Navegação ---
function hideAllSections() {
  catalogSection?.classList.add("hidden");
  detailsSection?.classList.add("hidden");
  aboutSection?.classList.add("hidden");
  moviesSection?.classList.add("hidden");
  seriesSection?.classList.add("hidden");
}

function showCatalog() {
  hideAllSections();
  catalogSection?.classList.remove("hidden");
}

function showAbout() {
  hideAllSections();
  aboutSection?.classList.remove("hidden");
}

function showMovies() {
  hideAllSections();
  moviesSection?.classList.remove("hidden");
}

function showSeries() {
  hideAllSections();
  seriesSection?.classList.remove("hidden");
}

// Carregamento inicial da pagina
async function handlePageLoad() {
  try {
    ui.showCatalogLoader();
    state.genreMap = await api.fetchGenres();
    ui.renderGenreOptions(state.genreMap);
    await loadCatalogMedia();
  } catch (err) {
    console.error(err);
    ui.showCatalogError("Ops! Algo deu errado. Tente atualizar a página.");
  }
}

// Carrega midias do catalogo
async function loadCatalogMedia() {
  try {
    const data = await api.fetchMedia(state.currentPage, state.selectedGenre);
    ui.hideCatalogLoader();

    if (data.results && data.results.length) {
      ui.clearCatalog();
      ui.renderMovies(data.results, state.genreMap, handleCardClick);
      state.totalPages = data.total_pages;
      ui.updateCatalogStatus(`Exibindo ${data.results.length} itens.`);
    } else {
      ui.updateCatalogStatus("Nenhum item encontrado para esta seleção.");
    }

    const hasMore = state.currentPage < state.totalPages;
    ui.updateLoadMoreButton(false, hasMore);
  } catch (err) {
    console.error(err);
    ui.showCatalogError("Erro ao carregar mídias. Tente novamente.");
  }
}

// Carrega mais itens no catalago
async function handleLoadMore() {
  if (state.currentPage >= state.totalPages) return;

  ui.updateLoadMoreButton(true, true);
  state.currentPage++;

  try {
    const data = await api.fetchMedia(state.currentPage, state.selectedGenre);
    if (data.results && data.results.length) {
      ui.renderMovies(data.results, state.genreMap, handleCardClick);
      ui.updateCatalogStatus(`Exibindo mais itens...`);
    }

    const hasMore = state.currentPage < state.total_pages;
    ui.updateLoadMoreButton(false, hasMore);

    if (!hasMore) {
      ui.updateCatalogStatus("Fim dos resultados.");
    }
  } catch (err) {
    console.error(err);
    state.currentPage--;
    ui.updateCatalogStatus("Erro ao carregar mais itens.");
    ui.updateLoadMoreButton(false, true);
  }
}

// Filtro por genero
async function handleGenreChange(event) {
  state.selectedGenre = event.target.value;
  state.currentPage = 1;

  ui.clearCatalog();
  ui.showCatalogLoader();
  await loadCatalogMedia();
}

// Clique em card para ver detalhes
async function handleCardClick(mediaId, mediaType) {
  hideAllSections();
  ui.showDetailsPage();

  try {
    ui.showDetailsLoader();
    const data = await api.fetchMediaDetails(mediaId, mediaType);

    data.media_type = mediaType;
    ui.renderMediaDetails(data);
    ui.hideDetailsLoader();

    await loadDetailsRecommendations(mediaId, mediaType);
  } catch (err) {
    console.error(err);
    let msg = "Erro ao carregar detalhes. Tente novamente.";
    if (err.message === "Item não encontrado.") {
      msg = "Item não encontrado em nossa base de dados.";
    }
    ui.showDetailsError(msg);
  }
}

// Carrega secao de filmes (APENAS PÁGINA 1)
async function loadMoviesSection() {
  try {
    ui.showMoviesLoader();
    moviesCurrentPage = 1;
    ui.clearMoviesList();

    const data = await api.fetchPopularMovies(moviesCurrentPage);

    ui.renderMoviesSection(data.results, handleCardClick);
    moviesTotalPages = data.total_pages;

    const hasMore = moviesCurrentPage < moviesTotalPages;
    ui.updateLoadMoreMoviesButton(false, hasMore);

    ui.hideMoviesLoader();
  } catch (err) {
    console.error(err);
    ui.showMoviesError("Erro ao carregar filmes.");
  }
}

// Carrega MAIS filmes (próximas páginas)
async function handleLoadMoreMovies() {
  if (moviesCurrentPage >= moviesTotalPages) return;

  ui.updateLoadMoreMoviesButton(true, true);
  moviesCurrentPage++;

  try {
    const data = await api.fetchPopularMovies(moviesCurrentPage);
    if (data.results && data.results.length) {
      ui.renderMoviesSection(data.results, handleCardClick);
    }

    const hasMore = moviesCurrentPage < data.total_pages;
    ui.updateLoadMoreMoviesButton(false, hasMore);
  } catch (err) {
    console.error(err);
    moviesCurrentPage--;
    ui.updateLoadMoreMoviesButton(false, true);
  }
}

// Carrega secao de series (APENAS PÁGINA 1)
async function loadSeriesSection() {
  try {
    ui.showSeriesLoader();
    seriesCurrentPage = 1;
    ui.clearSeriesList();

    const data = await api.fetchPopularSeries(seriesCurrentPage);

    ui.renderSeriesSection(data.results, handleCardClick);
    seriesTotalPages = data.total_pages;

    const hasMore = seriesCurrentPage < seriesTotalPages;
    ui.updateLoadMoreSeriesButton(false, hasMore);

    ui.hideSeriesLoader();
  } catch (err) {
    console.error(err);
    ui.showSeriesError("Erro ao carregar séries.");
  }
}

// Carrega MAIS series (próximas páginas)
async function handleLoadMoreSeries() {
  if (seriesCurrentPage >= seriesTotalPages) return;

  ui.updateLoadMoreSeriesButton(true, true);
  seriesCurrentPage++;

  try {
    const data = await api.fetchPopularSeries(seriesCurrentPage);
    if (data.results && data.results.length) {
      ui.renderSeriesSection(data.results, handleCardClick);
    }

    const hasMore = seriesCurrentPage < data.total_pages;
    ui.updateLoadMoreSeriesButton(false, hasMore);
  } catch (err) {
    console.error(err);
    seriesCurrentPage--;
    ui.updateLoadMoreSeriesButton(false, true);
  }
}

// Inicializacao de aplicacao
function init() {
  ui.elements.loadMoreBtn?.addEventListener("click", handleLoadMore);
  ui.elements.genreSelect?.addEventListener("change", handleGenreChange);
  ui.elements.backButton?.addEventListener("click", ui.showCatalogPage);

  ui.elements.loadMoreMoviesBtn?.addEventListener(
    "click",
    handleLoadMoreMovies
  );
  ui.elements.loadMoreSeriesBtn?.addEventListener(
    "click",
    handleLoadMoreSeries
  );

  // Links do menu
  const menuLinks = document.querySelectorAll(".menu-link");
  const homeMenu = Array.from(menuLinks).find((link) =>
    link.textContent.includes("Início")
  );
  const aboutMenu = Array.from(menuLinks).find((link) =>
    link.textContent.includes("Sobre Nós")
  );
  const moviesMenu = Array.from(menuLinks).find((link) =>
    link.textContent.includes("Filmes")
  );
  const seriesMenu = Array.from(menuLinks).find((link) =>
    link.textContent.includes("Séries")
  );

  // Event listeners do menu
  homeMenu?.addEventListener("click", (e) => {
    e.preventDefault();
    showCatalog();
  });

  aboutMenu?.addEventListener("click", (e) => {
    e.preventDefault();
    showAbout();
  });

  moviesMenu?.addEventListener("click", async (e) => {
    e.preventDefault();
    showMovies();
    await loadMoviesSection();
  });

  seriesMenu?.addEventListener("click", async (e) => {
    e.preventDefault();
    showSeries();
    await loadSeriesSection();
  });
}

// Carrega recomendacoes (filmes ou series)
async function loadDetailsRecommendations(mediaId, mediaType) {
  try {
    ui.showDetailsPopularLoader();

    const recommendations = await api.fetchRecommendations(mediaId, mediaType);

    ui.renderDetailsPopularMovies(
      recommendations,
      handleCardClick,
      "Recomendados"
    );

    ui.hideDetailsPopularLoader();
  } catch (err) {
    console.error(err);
    ui.showDetailsPopularError("Erro ao carregar recomendações.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  init();
  await handlePageLoad();
});
