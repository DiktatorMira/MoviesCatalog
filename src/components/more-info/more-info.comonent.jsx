import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovieById } from '@/features/movies/moviesSlice';
import Button from '../button/button.component';
import './more-info.component.scss';

export default function MoreInfoWindow({ onClose, movieId }) {
    const [isClosing, setIsClosing] = useState(false); // Стан для анімації закриття
    const [movie, setMovie] = useState(null); // Стан для збереження даних фільму
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.movies); // Витягуємо статус завантаження та помилку

    const handleClose = () => { // Обробка закриття вікна
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Чекаємо завершення анімації (300 мс)
    };
    const formatActors = (actors) => { // Форматування списку акторів
        if (!actors || !Array.isArray(actors) || actors.length === 0) return 'No actors listed';
        return actors // Перевіряємо, чи актори є об’єктами, і витягуємо поле name
            .map((actor) => (typeof actor === 'object' && actor.name ? actor.name : actor))
            .filter((actor) => actor) // Фільтруємо некоректні значення
            .join(', ');
    };

    useEffect(() => { // Закриття при натисканні ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc); // Прибираємо слухача при розмонтуванні
    }, []);
    useEffect(() => { // Завантаження даних фільму при монтажі компонента
        const loadMovie = async () => {
            try {
                const movieData = await dispatch(fetchMovieById(movieId)).unwrap();
                console.log('Movie data loaded:', movieData); // Лог для діагностики структури даних
                setMovie(movieData); // Зберігаємо дані фільму
            } catch (err) {
                console.error('Failed to load movie:', err);
            }
        };
        loadMovie();
    }, [dispatch, movieId]);

    return (
        <div className={`window-background ${isClosing ? 'closing' : ''}`}>
            <section className="more-info-section">
                {loading && <p>Loading movie details...</p>}
                {error && <p>Error: {error}</p>}
                {!loading && !error && movie && (
                    <>
                        <span><b>Movie Title:</b> {movie.title || 'N/A'}</span>
                        <span><b>Release Year:</b> {movie.year || 'N/A'}</span>
                        <span><b>Format:</b> {movie.format || 'N/A'}</span>
                        <span><b>Actors:</b> {formatActors(movie.actors)}</span>
                    </>
                )}
                {!loading && !error && !movie && <p>No movie data available!</p>}
                <Button onClick={handleClose}>Back</Button>
            </section>
        </div>
    );
}