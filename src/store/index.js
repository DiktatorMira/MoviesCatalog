import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from '@/features/movies/moviesSlice';

export const store = configureStore({ // створення Redux-сховища
    reducer: {
        movies: moviesReducer, 
    }
});