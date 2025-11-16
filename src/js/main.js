import { state } from "./state.js";
import * as api from "./api.js";
import * as ui from "./ui.js";

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

async function handleGenreChange(event) {
  state.selectedGenre = event.target.value;
  state.currentPage = 1;

  ui.clearCatalog();
  ui.showCatalogLoader();
  await loadCatalogMedia();
}

async function handleCardClick(mediaId, mediaType) {
  ui.showDetailsPage();
  try {
    ui.showDetailsLoader();
    const data = await api.fetchMediaDetails(mediaId, mediaType);
    
    data.media_type = mediaType;
    ui.renderMediaDetails(data);
    ui.hideDetailsLoader();
  } catch (err) {
    console.error(err);
    let msg = "Erro ao carregar detalhes. Tente novamente.";
    if (err.message === "Item não encontrado.") {
      msg = "Item não encontrado em nossa base de dados.";
    }
    ui.showDetailsError(msg);
  }
}

async function loadMoviesSection() {
  try {
    ui.showMoviesLoader();
    const movies = await api.fetchPopularMovies();
    ui.renderMoviesSection(movies, handleCardClick);
    ui.hideMoviesLoader();
  } catch (err) {
    console.error(err);
    ui.showMoviesError("Erro ao carregar filmes.");
  }
}

async function loadSeriesSection() {
  try {
    ui.showSeriesLoader();
    const series = await api.fetchPopularSeries();
    ui.renderSeriesSection(series, handleCardClick);
    ui.hideSeriesLoader();
  } catch (err) {
    console.error(err);
    ui.showSeriesError("Erro ao carregar séries.");
  }
}

function init() {
 
  ui.elements.loadMoreBtn?.addEventListener("click", handleLoadMore);
  ui.elements.genreSelect?.addEventListener("change", handleGenreChange);
  ui.elements.backButton?.addEventListener("click", ui.showCatalogPage);

  const catalogSection = document.querySelector(".catalog-section");
  const detailsSection = document.getElementById("details-section");
  const aboutSection = document.getElementById("about-section");
  const moviesSection = document.getElementById("movies-section");
  const seriesSection = document.getElementById("series-section");

  const menuLinks = document.querySelectorAll(".menu-link");
  const homeMenu = Array.from(menuLinks).find(link => link.textContent.includes("Início"));
  const aboutMenu = Array.from(menuLinks).find(link => link.textContent.includes("Sobre Nós"));
  const moviesMenu = Array.from(menuLinks).find(link => link.textContent.includes("Filmes"));
  const seriesMenu = Array.from(menuLinks).find(link => link.textContent.includes("Séries"));

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


document.addEventListener("DOMContentLoaded", async () => {
  init();
  await handlePageLoad();
});
