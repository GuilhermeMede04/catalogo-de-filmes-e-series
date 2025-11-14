import { state } from "./state.js";
import * as api from "./api.js";
import * as ui from "./ui.js";

// --- Controladores de Lógica ---

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

    const hasMore = state.currentPage < state.totalPages;
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

function init() {
  document.addEventListener("DOMContentLoaded", handlePageLoad);
  ui.elements.loadMoreBtn.addEventListener("click", handleLoadMore);
  ui.elements.genreSelect.addEventListener("change", handleGenreChange);
  ui.elements.backButton.addEventListener("click", ui.showCatalogPage);
}

init();
