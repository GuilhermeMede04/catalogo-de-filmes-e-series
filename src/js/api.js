const API_KEY = "70e5c08fa5e2c8c560ca36e87aa1f913";
const API_BASE = "https://api.themoviedb.org/3";

export async function fetchGenres() {
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

export async function fetchMedia(page = 1, genre = "") {
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

export async function fetchMediaDetails(mediaId, mediaType) {
  const endpoint = mediaType === "movie" ? "movie" : "tv";
  const response = await fetch(
    `${API_BASE}/${endpoint}/${mediaId}?api_key=${API_KEY}&language=pt-BR`
  );

  if (!response.ok) {
    if (response.status === 404) throw new Error("Item não encontrado.");
    throw new Error("Não foi possível carregar os detalhes.");
  }

  return await response.json();
}
