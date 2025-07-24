import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteMovie } from '@/features/movies/moviesSlice';
import Button from '../button/button.component';
import './window.component.scss'

export default function ModalWindow({ onClose, movieId }) {
    const [isClosing, setIsClosing] = useState(false);
    const dispatch = useDispatch();

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => { onClose(); }, 300); // Даємо час 300 мс для виконання анімації перед закриттям
    };
    const handleConfirm = async () => {
        try {
            await dispatch(deleteMovie(movieId)).unwrap(); // Викликаємо екшен для видалення фільму
            handleClose(); // Закриваємо модальне вікно після успішного видалення
        } catch (error) {
            console.error('Error deleting movie:', error);
        }
    };
    const handleCancel = () => { handleClose(); };
    
    useEffect(() => { setIsClosing(false); }, []); // Скидаємо стан закриття під час монтування компонента
    useEffect(() => {
        const handleEsc = (e) => { // Закриття модального вікна при натисканні ESC
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc); // Прибираємо слухача подій при розмонтуванні
    }, []);

    return (
        <div className={`window-background ${isClosing ? 'closing' : ''}`}>
            <section>
                <h1>Wait!</h1>
                <span>Are you sure you want to delete the movie?</span>
                <div className="for-button">
                    <Button type="button" onClick={handleCancel}>Cancel</Button>
                    <Button type="button" onClick={handleConfirm}>Yes!</Button>
                </div>
            </section>
        </div>
    );
}