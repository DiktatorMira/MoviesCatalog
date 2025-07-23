import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMovie } from '@/features/movies/moviesSlice';
import Button from '../button/button.component';
import './form.component.scss';

export default function Form({ title, onClose }) {
  const dispatch = useDispatch(); // Ініціалізація диспетчера для виклику Redux-екшенів
  // Отримуємо стан завантаження та помилки з Redux
  const { loading, error } = useSelector((state) => state.movies);
  const [formData, setFormData] = useState({ // Стан для зберігання даних форми
    title: '',
    year: '',
    format: '',
    author: '',
  });
  const [isValid, setIsValid] = useState(false); // Чи валідна форма
  const [isClosing, setIsClosing] = useState(false); // Статус закриття форми
  const [formError, setFormError] = useState(''); // Помилка форми

  const handleInputChange = (event) => { // Обробка зміни значень у полях форми
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value })); // Оновлюємо поле
    setFormError(''); // Очищаємо помилки
  };
  const handleSubmit = async (e) => { // Обробка відправки форми
    e.preventDefault();
    if (isValid) {
      try {
        const movieData = { // Формуємо дані для відправки на сервер
          title: formData.title,
          year: parseInt(formData.year, 10),
          format: formData.format.toLowerCase(), // Приводимо формат до нижнього регістру (напр., 'dvd')
          actors: formData.author.split(',').map((actor) => actor.trim()), // Розбиваємо рядок акторів на масив
        };
        console.log('Відправка фільму:', movieData);
        await dispatch(addMovie(movieData)).unwrap(); // Викликаємо екшен для додавання фільму
        setFormData({ title: '', year: '', format: '', author: '' }); // Очищаємо форму
        handleClose(); // Закриваємо форму
      } catch (err) {
        console.error('Помилка addMovie:', err);
        const errorMessage =  // Формуємо повідомлення про помилку
          err?.fields && Object.keys(err.fields).length > 0
            ? Object.entries(err.fields).map(([field, message]) => `${field}: ${message}`).join('; ')
            : err.message || 'Failed to add movie';
        setFormError(errorMessage); // Показуємо помилку користувачу
      }
    }
  };
  const handleCancel = () => { // Обробка скасування введення
    setFormData({ title: '', year: '', format: '', author: '' }); // Очищаємо форму
    setFormError(''); // Очищаємо помилки
    handleClose(); // Закриваємо форму
  };
  const handleClose = () => { // Закриття форми з анімацією
    setIsClosing(true);
    setTimeout(() => { onClose(); }, 300); // Затримка для анімації
  };
  const handleBackgroundClick = (e) => { // Закриття форми по кліку на фон
    if (e.target === e.currentTarget) handleClose();
  };

  useEffect(() => { setIsClosing(false); }, []); // Ініціалізація стану закриття форми
  useEffect(() => { // Обробка натискання клавіші Escape для закриття форми
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc); // Прибираємо слухача
  }, []);
  useEffect(() => { // Перевірка валідності форми
    const authorWords = formData.author.trim().split(/\s+/);
    const isAuthorValid = authorWords.length >= 2 && authorWords.every((word) => word.length > 0); // Перевіряємо, що є хоча б два слова
    const year = parseInt(formData.year, 10);
    const isYearValid = !isNaN(year) && year >= 1900 && year <= new Date().getFullYear(); // Перевіряємо рік
    const isFormValid =
      formData.title.trim() !== '' &&
      isYearValid &&
      formData.format !== '' &&
      isAuthorValid;

    setIsValid(isFormValid); // Оновлюємо стан валідності
  }, [formData]);

  return (
    <div className={`form-background ${isClosing ? 'closing' : ''}`} onClick={handleBackgroundClick}>
      <form onSubmit={handleSubmit}>
        <h2>{title}</h2>
        <input
          type="text"
          name="title"
          placeholder="Movie title"
          value={formData.title}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="year"
          placeholder="Year of release"
          value={formData.year}
          onChange={handleInputChange}
        />
        <select name="format" value={formData.format} onChange={handleInputChange}>
          <option value="" disabled>Choose a format</option>
          <option value="VHS">VHS</option>
          <option value="DVD">DVD</option>
          <option value="Blu-Ray">Blu-Ray</option>
        </select>
        <input
          type="text"
          name="author"
          placeholder="Actors (e.g., Ivan Ivanov, Maria Petrova)"
          value={formData.author}
          onChange={handleInputChange}
        />
        {formError && <div className="form-error">{formError}</div>}
        {error && <div className="form-error">{error}</div>}
        <div className="for-button">
          <Button type="button" onClick={handleCancel}>Cancel</Button>
          <Button type="submit" disabled={!isValid || loading}>{loading ? 'Adding...' : 'Apply'}</Button>
        </div>
      </form>
    </div>
  );
}
