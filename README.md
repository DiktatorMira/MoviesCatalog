# Movies Catalog - React Application

Веб-додаток для керування каталогом фільмів, побудований на React.js з використанням Redux Toolkit.

## Функціональність

- ✅ Додавання фільмів
- ✅ Видалення фільмів
- ✅ Перегляд інформації про фільм
- ✅ Сортування фільмів за назвою в алфавітному порядку
- ✅ Пошук фільмів за назвою
- ✅ Пошук фільмів на ім'я актора
- ✅ Імпорт фільмів із текстового файлу
- ✅ Аутентифікація користувача

## Технології

- React.js 18+
- Redux Toolkit
- Vite
- SCSS
- Axios
- Docker

## Вимоги

- Node.js 18+
- Docker
- Docker Compose (опционально)

## Швидкий запуск

### 1. Запуск backend сервера (API)

```bash
docker run -d --name movies-api -p 8000:8000 webbylabhub/movies
```

### 2. Запуск frontend програми

```bash
docker run --name movies -p 3000:3000 -e API_URL=http://localhost:8000/api/v1 diktatormira/movies
```

## Локальна розробка

### 1. Клонування репозиторію

```bash
git clone https://github.com/DiktatorMira/MoviesCatalog
cd movies-catalog
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування змінних оточення

Файл `.env` в корені проекту:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_AUTH_EMAIL=your-email@example.com
VITE_AUTH_PASSWORD=your-password
```

### 4. Запуск у режимі розробки

```bash
# Запуск API сервера
docker run -d --name movies-api -p 8000:8000 webbylabhub/movies

# Запуск frontend програми
npm run dev
```

Програма буде доступна за адресою: http://localhost:5173

## Складання Docker образу

### 1. Складання образу

```bash
docker build -t diktatormira/movies .
```

### 2. Запуск зібраного образу

```bash
docker run --name movies -p 3000:3000 -e API_URL=http://localhost:8000/api/v1 diktatormira/movies
```

### 3. Публікація в Docker Hub

```bash
# Вхід до Docker Hub
docker login

# Тегування образу
docker tag diktatormira/movies diktatormira/movies:latest

# Завантаження в Docker Hub
docker push diktatormira/movies:latest
```

## Конфігурація

Програма налаштовується через змінні оточення:

|   Змінна   |   Опис   | Значення за замовчуванням |
|------------|----------|----------------------|
| `API_URL` | URL бэкенд API сервера | `http://localhost:8000/api/v1` |
| `VITE_AUTH_EMAIL` | Email для автоматичної автентифікації | - |
| `VITE_AUTH_PASSWORD` | Пароль для автоматичної автентифікації | - |

## Використання

### Аутентифікація

Під час першого запуску введіть дані для входу до системи. Якщо в `.env` файлі вказані `VITE_AUTH_EMAIL` та `VITE_AUTH_PASSWORD`, автентифікація відбудеться автоматично.

### Управління фільмами

1. **Додавання фільму**: Натисніть "Add movie" у бічному меню
2. **Редагування**: Натисніть "Edit movie" у списку фільмів
3. **Видалення**: Натисніть "Delete movie" у списку фільмів і підтвердіть дію
4. **Перегляд деталей**: Натисніть "More info" у списку фільмів для перегляду повної інформації

### Пошук та сортування

- Використовуйте поле "Search by movie title" для пошуку за назвою
- Використовуйте поле "Search by actor name" для пошуку за актором
- Натисніть "Sort alphabetically" для сортування списку

### Імпорт фільмів

1. Натисніть "Import from file" у бічному меню
2. Виберіть текстовий файл із фільмами
3. Формат файлу повинен відповідати прикладу із завдання

## API

Програма працює з API, що надається Docker чином `webbylabhub/movies`.

Документація API: https://documenter.getpostman.com/view/356840/TzkyLeVK

## Приклади команд Docker

### Повне середовище з docker-compose

Створіть файл `docker-compose.yml`:

``yaml
version: '3.8'
services: 
api: 
image: webbylabhub/movies 
ports: 
- "8000:8000" 

frontend: 
image: diktatormira/movies 
ports: 
- "3000:3000" 
environment: 
- API_URL=http://api:8000/api/v1 
depends_on: 
- api
````

Запуск:

``` bash
docker-compose up -d
````

### Очищення

``` bash
# Зупинка та видалення контейнерів
docker stop movies movies-api
docker rm movies movies-api

# Видалення образів
docker rmi diktatormira/movies webbylabhub/movies
````

## Структура проекту

````
src/
├── components/ # React компоненти
│ ├── button/ # Компонент кнопки
│ ├── form/ # Форма додавання/редагування
│ ├── more-info/ # Модальне вікно з деталями
│ └── window/ # Модальне вікно підтвердження
├── features/
│ └── movies/ # Redux slice для фільмів
├── app.scss # Основні стилі
└── App.js # Головний компонент
````

## Підтримка

Якщо у вас виникли проблеми:

1. Переконайтеся, що сервер API запущено та доступний
2. Перевірте правильність змінних оточення
3. Переконайтеся, що порти 3000 та 8000 вільні

## Ліцензія

MIT License