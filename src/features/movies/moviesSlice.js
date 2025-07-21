import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API URL зі змінної оточення
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const initialState = { // початковий стан
  items: [],
  loading: false,
  error: null,
  searchResults: [],
  token: null,
};

// Асинхронна дія для створення сесії та отримання JWT-токену
export const createSession = createAsyncThunk('movies/createSession', async ({ email, password }) => {
  const response = await axios.post(`${API_URL}/sessions`, { email, password });
  return response.data.token;
});
// Асинхронні дії для роботи з API
export const fetchMovies = createAsyncThunk('movies/fetchMovies', async (_, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.get(`${API_URL}/movies`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
});
// Додавання фільму
export const addMovie = createAsyncThunk('movies/addMovie', async (movie, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.post(`${API_URL}/movies`, movie, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
});
// Видалення фільму
export const deleteMovie = createAsyncThunk('movies/deleteMovie', async (id, { getState }) => {
  const { token } = getState().movies;
  await axios.delete(`${API_URL}/movies/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});
// Пошук фільму за назвою
export const searchByTitle = createAsyncThunk('movies/searchByTitle', async (title, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.get(`${API_URL}/movies/search?title=${encodeURIComponent(title)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
});
// Пошук фільму за актором
export const searchByActor = createAsyncThunk('movies/searchByActor', async (actor, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.get(`${API_URL}/movies/search?actor=${encodeURIComponent(actor)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
});
// Імпорт каталогу фільмів з файлу
export const importMovies = createAsyncThunk('movies/importMovies', async (file, { getState }) => {
  const { token } = getState().movies;
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/movies/import`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
});

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    sortMovies(state) { state.items.sort((a, b) => a.title.localeCompare(b.title)); },
    clearSearchResults(state) { state.searchResults = []; },
    clearToken(state) { state.token = null; },
  },
  extraReducers: (builder) => {
     // Створення сессії
    builder.addCase(createSession.fulfilled, (state, action) => {
      state.token = action.payload;
    });
    builder.addCase(createSession.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to create session';
    });
    // Отримання фільмів
    builder.addCase(fetchMovies.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMovies.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchMovies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to load movies';
    });
    // Додавання фільму
    builder.addCase(addMovie.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });
    builder.addCase(addMovie.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to add movie';
    });
    // Видалення фільму
    builder.addCase(deleteMovie.fulfilled, (state, action) => {
      state.items = state.items.filter((movie) => movie.id !== action.payload);
    });
    builder.addCase(deleteMovie.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to delete movie';
    });
    // Пошук за назвою
    builder.addCase(searchByTitle.fulfilled, (state, action) => {
      state.searchResults = action.payload;
    });
    builder.addCase(searchByTitle.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to search any film for title';
    });
    // Пошук за актором
    builder.addCase(searchByActor.fulfilled, (state, action) => {
      state.searchResults = action.payload;
    });
    builder.addCase(searchByActor.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to search any film for actor';
    });
    // Імпорт фільмів
    builder.addCase(importMovies.fulfilled, (state, action) => {
      state.items = [...state.items, ...action.payload];
    });
    builder.addCase(importMovies.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to import movies from file';
    });
  },
});

export const { sortMovies, clearSearchResults, clearToken } = moviesSlice.actions;
export default moviesSlice.reducer;