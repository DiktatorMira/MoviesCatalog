import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies, createSession, searchByTitle, searchByActor, sortMovies, clearSearchResults } from '@/features/movies/moviesSlice';
import Form from './components/form/form.component';
import ModalWindow from './components/window/window.component';
import Button from './components/button/button.component';
import './app.scss';

export default function App() {
  // Ініціалізація диспетчера для виклику Redux-екшенів
  const dispatch = useDispatch();
  // Витягуємо дані зі стану Redux: список фільмів, статус завантаження, помилки, токен, результати пошуку
  const { items: movies, loading, error, token, searchResults = [] } = useSelector((state) => state.movies);
  // Створюємо стани для управління інтерфейсом
  const [isModalWindowVisible, setIsModalWindowVisible] = useState(false); // Видимість модального вікна
  const [isFormVisible, setIsFormVisible] = useState(false); // Видимість форми
  const [formTitle, setFormTitle] = useState(''); // Заголовок форми
  const [authCredentials, setAuthCredentials] = useState({
    email: '',
    password: '',
  }); // Дані для автентифікації
  const [authError, setAuthError] = useState(''); // Помилка автентифікації
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Статус процесу автентифікації
  const [showAuthForm, setShowAuthForm] = useState(false); // Показ форми автентифікації
  const [isSearching, setIsSearching] = useState(false); // Чи активний режим пошуку
  const [hasFetched, setHasFetched] = useState(false); // Чи були завантажені фільми
  // Вибираємо, які фільми показувати: результати пошуку чи повний список
  const displayMovies = isSearching ? searchResults : movies;

  const handleManualAuth = async (e) => { // Обробка ручної автентифікації через форму
    e.preventDefault();
    setIsAuthenticating(true); // Починаємо процес автентифікації
    setAuthError(''); // Очищаємо попередні помилки
    try {
      await dispatch(createSession(authCredentials)).unwrap(); // Викликаємо екшен для створення сесії
      setShowAuthForm(false); // Ховаємо форму після успішного входу
    } catch (error) {
      setAuthError('Помилка входу. Перевірте email та пароль.'); // Показуємо помилку
    } finally {
      setIsAuthenticating(false); // Завершуємо процес автентифікації
    }
  };
  const handleAuthInputChange = (e) => { // Обробка зміни даних у полях форми автентифікації
    setAuthCredentials({
      ...authCredentials,
      [e.target.name]: e.target.value, // Оновлюємо email або пароль
    });
  };
  const openForm = (title) => {   // Відкриття форми з заданим заголовком
    setFormTitle(title);
    setIsFormVisible(true);
  };
  const closeForm = () => { setIsFormVisible(false); };
  const openModalWindow = () => { setIsModalWindowVisible(true); };
  const closeModalWindow = () => { setIsModalWindowVisible(false); };
  const handleSortMovies = () => {
    if (isSearching) {
      setIsSearching(false); // Вимикаємо режим пошуку
      dispatch(clearSearchResults()); // Очищаємо результати пошуку
    }
    dispatch(sortMovies()); // Викликаємо екшен для сортування
  };
  const handleSearchByTitle = (event) => { // Пошук фільмів за назвою
    const title = event.target.value.trim();
    if (title) {
      setIsSearching(true); // Вмикаємо режим пошуку
      dispatch(searchByTitle(title)); // Викликаємо пошук за назвою
    } else {
      setIsSearching(false); // Вимикаємо режим пошуку
      dispatch(clearSearchResults()); // Очищаємо результати
    }
  };
  const handleSearchByActor = (event) => {  // Пошук фільмів за актором
    const actor = event.target.value.trim();
    if (actor) {
      setIsSearching(true); // Вмикаємо режим пошуку
      dispatch(searchByActor(actor)); // Викликаємо пошук за актором
    } else {
      setIsSearching(false); // Вимикаємо режим пошуку
      dispatch(clearSearchResults()); // Очищаємо результати
    }
  };

  useEffect(() => { // Завантаження фільмів після автентифікації
    if (token && !loading && movies.length === 0 && !hasFetched) {
      dispatch(fetchMovies()); // Завантажуємо список фільмів
      setHasFetched(true); // Позначаємо, що фільми були запитані
    }
  }, [token, dispatch, loading, movies.length, hasFetched]);
  useEffect(() => { // Автоматична автентифікація при запуску
    const initializeApp = async () => {
      setIsAuthenticating(true); // Починаємо автентифікацію
      try {
        const email = import.meta.env.VITE_AUTH_EMAIL;
        const password = import.meta.env.VITE_AUTH_PASSWORD;
        if (email && password) {
          const credentials = { email, password };
          await dispatch(createSession(credentials)).unwrap(); // Спроба автоматичного входу
          console.log('Автентифікація успішна');
        } else {
          console.log('Немає даних у .env, показуємо форму входу');
          setShowAuthForm(true); // Показуємо форму, якщо немає даних
        }
      } catch (error) {
        console.error('Помилка автоматичної автентифікації:', error);
        setAuthError('Автоматичний вхід не вдався. Введіть дані вручну.');
        setShowAuthForm(true);
      } finally {
        setIsAuthenticating(false); // Завершуємо автентифікацію
      }
    };
    initializeApp();
  }, [dispatch]);

  if (showAuthForm || (!token && !isAuthenticating)) { // Показ форми автентифікації, якщо користувач не автентифікований
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>Login the movie catalog</h2>
          <form onSubmit={handleManualAuth}>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={authCredentials.email}
                onChange={handleAuthInputChange}
                required
                disabled={isAuthenticating}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={authCredentials.password}
                onChange={handleAuthInputChange}
                required
                disabled={isAuthenticating}
              />
            </div>
            {authError && <div className="auth-error">{authError}</div>}
            <Button type="submit" disabled={isAuthenticating} className="auth-button">
              {isAuthenticating ? 'Login...' : 'Log in'}
            </Button>
          </form>
        </div>
      </div>
    );
  }
  if (isAuthenticating) { // Показ індикатора завантаження під час автентифікації
    return (
      <div className="loading-container">
        <div className="loading-message">Connecting to the system...</div>
      </div>
    );
  }

  return (
    <>
      <aside className="menu">
        <ul className="buttons">
          <li onClick={() => openForm('Add movie')}>Add movie</li>
          <li onClick={() => openForm('Edit movie')}>Edit movie</li>
          <li onClick={() => openModalWindow()}>Delete movie</li>
          <li>Import from file</li>
        </ul>
      </aside>
      <section className="left-section">
        <header>
          <Button className="sort-button" onClick={handleSortMovies}>Sort alphabetically</Button>
          <input
            type="text"
            name="movie-name"
            placeholder="Search by movie title"
            onChange={handleSearchByTitle}
          />
          <input
            type="text"
            name="actor-name"
            placeholder="Search by actor name"
            onChange={handleSearchByActor}
          />
        </header>
        <ul className="movies-list">
          {loading && <li>Downloading movies...</li>}
          {error && <li>Error: {error}</li>}
          {!loading && !error && displayMovies.length === 0 && (
            <li>{isSearching ? 'No movies found!' : 'No movies available!'}</li>
          )}
          {!loading &&
            !error &&
            displayMovies.length > 0 &&
            displayMovies
              .filter((movie) => movie && typeof movie === 'object' && movie.id && movie.title) // Фільтруємо некоректні дані
              .map((movie) => (
                <li key={movie.id}>{movie.title}</li>
              ))}
        </ul>
      </section>
      {isFormVisible && <Form title={formTitle} onClose={closeForm} />}
      {isModalWindowVisible && <ModalWindow onClose={closeModalWindow} />}
    </>
  );
}
