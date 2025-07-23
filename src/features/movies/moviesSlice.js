import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const initialState = {
  items: [],
  loading: false,
  error: null,
  searchResults: [],
  token: null,
};

export const createSession = createAsyncThunk('movies/createSession', async ({ email, password }) => {
  const response = await axios.post(`${API_URL}/sessions`, { email, password });
  return response.data.token;
});
export const fetchMovies = createAsyncThunk('movies/fetchMovies', async (_, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.get(`${API_URL}/movies?limit=20&offset=0`, {
    headers: { Authorization: token },
  });
  console.log('fetchMovies response:', response.data);
  const movies = response.data.data || [];
  return Array.isArray(movies) ? movies.filter((movie) => movie && movie.id && movie.title) : [];
});
export const addMovie = createAsyncThunk('movies/addMovie', async (movie, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.post(`${API_URL}/movies`, movie, {
    headers: { Authorization: token },
  });
  console.log('addMovie response:', response.data);
  return response.data.data || {};
});
export const editMovie = createAsyncThunk('movies/editMovie', async ({ id, movie }, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.post(`${API_URL}/movies`, movie, {
    headers: { Authorization: token },
  });
  console.log('editMovie response:', response.data);
  return { id, ...response.data.data };
});
export const deleteMovie = createAsyncThunk('movies/deleteMovie', async (id, { getState }) => {
  const { token } = getState().movies;
  await axios.delete(`${API_URL}/movies/${id}`, {
    headers: { Authorization: token },
  });
  return id;
});
export const searchByTitle = createAsyncThunk('movies/searchByTitle', async (title, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.get(`${API_URL}/movies?title=${encodeURIComponent(title)}`, {
    headers: { Authorization: token },
  });
  console.log('searchByTitle response:', response.data);
  const results = response.data.data || [];
  return Array.isArray(results) ? results.filter((movie) => movie && movie.id && movie.title) : [];
});
export const searchByActor = createAsyncThunk('movies/searchByActor', async (actor, { getState }) => {
  const { token } = getState().movies;
  const response = await axios.get(`${API_URL}/movies?actor=${encodeURIComponent(actor)}`, {
    headers: { Authorization: token },
  });
  console.log('searchByActor response:', response.data);
  const results = response.data.data || [];
  return Array.isArray(results) ? results.filter((movie) => movie && movie.id && movie.title) : [];
});
export const importMovies = createAsyncThunk('movies/importMovies', async (file, { getState }) => {
  const { token } = getState().movies;
  const formData = new FormData();
  formData.append('movies', file);
  const response = await axios.post(`${API_URL}/movies/import`, formData, {
    headers: {
      Authorization: token,
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('importMovies response:', response.data);
  const movies = response.data.data || [];
  return Array.isArray(movies) ? movies.filter((movie) => movie && movie.id && movie.title) : [];
});

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    sortMovies(state) { state.items.sort((a, b) => (a.title || '').localeCompare(b.title || '')); },
    clearSearchResults(state) { state.searchResults = []; },
    clearToken(state) { state.token = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.token = action.payload;
        state.loading = false;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create session';
      })
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.loading = false;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load movies';
        if (action.error.message.includes('WRONG_TOKEN')) state.token = null;
      })
      .addCase(addMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMovie.fulfilled, (state, action) => {
        if (action.payload && action.payload.id && action.payload.title) {
          state.items.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(addMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add movie';
      })
      .addCase(deleteMovie.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.items = state.items.filter((movie) => movie.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteMovie.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete movie';
      })
      .addCase(searchByTitle.fulfilled, (state, action) => {
        state.searchResults = action.payload || [];
      })
      .addCase(searchByTitle.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to search by title';
      })
      .addCase(searchByActor.fulfilled, (state, action) => {
        state.searchResults = action.payload || [];
      })
      .addCase(searchByActor.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to search by actor';
      })
      .addCase(importMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importMovies.fulfilled, (state, action) => {
        state.items = [...state.items, ...(action.payload || [])];
        state.loading = false;
      })
      .addCase(importMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to import movies';
      });
  },
});

export const { sortMovies, clearSearchResults, clearToken, clearError } = moviesSlice.actions;
export default moviesSlice.reducer;