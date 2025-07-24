import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies, createSession, searchByTitle, searchByActor, sortMovies, clearSearchResults, fetchMovieById, importMovies } from '@/features/movies/moviesSlice';
import Form from './components/form/form.component';
import ModalWindow from './components/window/window.component';
import MoreInfoWindow from './components/more-info/more-info.comonent';
import Button from './components/button/button.component';
import './app.scss';

export default function App() {
  const dispatch = useDispatch();
  const { items: movies, loading, error, token, searchResults = [] } = useSelector((state) => state.movies); // Витягуємо дані зі стану Redux
  const [isModalWindowVisible, setIsModalWindowVisible] = useState(false); // Видимість модального вікна
  const [isMoreInfoWindowVisible, setIsMoreInfoWindowVisible] = useState(false); // Видимість окна з більше інформації
  const [isFormVisible, setIsFormVisible] = useState(false); // Видимість форми
  const [formTitle, setFormTitle] = useState(''); // Заголовок форми
  const [editingMovie, setEditingMovie] = useState(null); // Фільм для редагування
  const [authCredentials, setAuthCredentials] = useState({ // Дані для автентифікації
    email: '',
    password: '',
  });
  const [authError, setAuthError] = useState(''); // Помилка автентифікації
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Статус процесу автентифікації
  const [showAuthForm, setShowAuthForm] = useState(false); // Показ форми автентифікації
  const [isSearching, setIsSearching] = useState(false); // Чи активний режим пошуку
  const [hasFetched, setHasFetched] = useState(false); // Чи були завантажені фільми
  const [movieToDelete, setMovieToDelete] = useState(null); // ID фільму для видалення
  const [importError, setImportError] = useState(''); // Помилка імпорту файлу
  const fileInputRef = useRef(null); // Референс для input file
  const displayMovies = isSearching ? searchResults : movies; // Вибираємо, які фільми показувати: результати пошуку чи повний список

  const handleImportFile = () => {  // Обробник для виклику вибору файлу
    fileInputRef.current.click(); // Програмно викликаємо клік на input
  };
  const handleFileChange = async (event) => { // Обробник зміни файлу для імпорту
    const file = event.target.files[0];
    if (!file) return; // Якщо файл не вибрано, виходимо
    setImportError(''); // Очищаємо попередні помилки
    try {
      await dispatch(importMovies(file)).unwrap(); // Викликаємо екшен для імпорту фільмів
      alert('Movies successfully imported!'); // Повідомлення про успіх
    } catch (error) {
      const errorMessage = 'Failed to import movies. Please check the file format.';
      setImportError(errorMessage); // Зберігаємо помилку
      console.error(errorMessage, error);
      alert('Error importing movies. Check file format.'); // Повідомлення про помилку
    }
    fileInputRef.current.value = ''; // Очищаємо input після імпорту
  };
  const handleManualAuth = async (e) => { // Обробка ручної автентифікації через форму
    e.preventDefault();
    setIsAuthenticating(true); // Починаємо процес автентифікації
    setAuthError(''); // Очищаємо попередні помилки
    try {
      await dispatch(createSession(authCredentials)).unwrap(); // Викликаємо екшен для створення сесії
      setShowAuthForm(false); // Ховаємо форму після успішного входу
    } catch (error) {
      setAuthError('Login error. Check your email and password.'); // Показуємо помилку
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
  const openAddForm = () => { // Відкриття форми для додавання нового фільму
    setFormTitle('Add movie');
    setEditingMovie(null); // Очищаємо дані для редагування
    setIsFormVisible(true);
  }; 
  const openEditForm = async (movie) => { // Відкриття форми для редагування існуючого фільму
    setFormTitle('Edit movie');
    try {
      const fullMovieData = await dispatch(fetchMovieById(movie.id)).unwrap(); // Завантажуємо повну інформацію про фільм
      setEditingMovie(fullMovieData); // Передаємо повні дані фільму для редагування
    } catch (error) {
      console.error('Error loading movie data:', error);
      setEditingMovie(movie); // Використовуємо наявні дані, якщо не вдалося завантажити повні
    }
    setIsFormVisible(true);
  };
  const closeForm = () => { // Закриття форми
    setIsFormVisible(false);
    setEditingMovie(null); // Очищаємо дані редагування
  };
  const openModalWindow = (movieId) => { // Відкриття модального вікна для підтвердження видалення
    setMovieToDelete(movieId); // Зберігаємо ID фільму для видалення
    setIsModalWindowVisible(true);
  };
  const closeModalWindow = () => { // Закриття модального вікна
    setIsModalWindowVisible(false);
    setMovieToDelete(null); // Очищаємо ID фільму
  };
  const openMoreInfoWindow = (movieId) => { // Відкриття вікна більше інформації
    setMovieToDelete(movieId); // Зберігаємо ID фільму для видалення
    setIsMoreInfoWindowVisible(true);
  };
  const closeMoreInfoWindow = () => { // Закриття вікна більше інформації
    setIsMoreInfoWindowVisible(false);
    setMovieToDelete(null); // Очищаємо ID фільму
  };
  const handleSortMovies = () => { // Сортування фільмів
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
  const handleSearchByActor = (event) => { // Пошук фільмів за актором
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
        } else {
          console.log('No data in .env, showing login form');
          setShowAuthForm(true); // Показуємо форму, якщо немає даних
        }
      } catch (error) {
        console.error('Automatic authentication error:', error);
        setAuthError('Automatic login failed. Please enter your details manually.');
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
          <h2>Enter the movie catalog</h2>
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
          <li onClick={openAddForm}>Add movie</li>
          <li onClick={handleImportFile}>Import from file</li>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }} // Приховуємо input для вибору файлу
            accept=".txt" // Дозволяємо лише текстові файли
            onChange={handleFileChange} // Обробник вибору файлу
          />
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
          {loading && <li>Download movies...</li>}
          {error && <li>Error: {error}</li>}
          {importError && <li>Помилка імпорту: {importError}</li>}
          {!loading && !error && displayMovies.length === 0 && (
            <li>{isSearching ? 'No movies found!' : 'No movies available!'}</li>
          )}
          {!loading &&
            !error &&
            displayMovies.length > 0 &&
            displayMovies
              .filter((movie) => movie && typeof movie === 'object' && movie.id && movie.title) // Фільтруємо некоректні дані
              .map((movie) => (
                <li key={movie.id}>
                  {movie.title}
                  <div className="for-buttons">
                    <Button onClick={() => openMoreInfoWindow(movie.id)}>More info</Button>
                    <Button onClick={() => openEditForm(movie)}>Edit movie</Button>
                    <Button onClick={() => openModalWindow(movie.id)}>Delete movie</Button>
                  </div>
                </li>
              ))}
        </ul>
      </section>
      {isMoreInfoWindowVisible && <MoreInfoWindow onClose={closeMoreInfoWindow} movieId={movieToDelete} />}
      {isFormVisible && <Form title={formTitle} onClose={closeForm} editingMovie={editingMovie} />}
      {isModalWindowVisible && <ModalWindow onClose={closeModalWindow} movieId={movieToDelete} />}
    </>
  );
}