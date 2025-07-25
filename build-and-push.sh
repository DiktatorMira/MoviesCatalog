#!/bin/bash
# Скрипт для складання та публікації Docker образу

# Кольори для виведення
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функція для виведення кольорового тексту
print_color() {
    echo -e "${1}${2}${NC}"
}

# Перевіряємо, чи передано ім'я користувача Docker Hub
if [ -z "$1" ]; then
    print_color "$RED" "Помилка: Необхідно вказати ім'я користувача Docker Hub"
    echo "Використання: $0 <docker-hub-username>"
    echo "Приклад: $0 myusername"
    exit 1
fi

DOCKER_USERNAME=$1
IMAGE_NAME="movies"
FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME"

print_color "$YELLOW" "Починаємо складання Docker образу..."

# Складання образу
print_color "$YELLOW" "Крок 1: Складання образу $FULL_IMAGE_NAME"
if docker build -t "$FULL_IMAGE_NAME" .; then
    print_color "$GREEN" "✅ Образ успішно зібраний"
else
    print_color "$RED" "❌ Помилка при складанні образу"
    exit 1
fi

# Тегування образу як latest
print_color "$YELLOW" "Крок 2: Тегування образа як latest"
if docker tag "$FULL_IMAGE_NAME" "$FULL_IMAGE_NAME:latest"; then
    print_color "$GREEN" "✅ Образ успішно відзначений тегом latest"
else
    print_color "$RED" "❌ Помилка під час тегування образу"
    exit 1
fi

# Перевірка входу в Docker Hub
print_color "$YELLOW" "Крок 3: Перевірка авторизації в Docker Hub"
if ! docker info | grep -q "Username"; then
    print_color "$YELLOW" "Необхідна авторизація в Docker Hub"
    docker login
fi

# Публікація образу
print_color "$YELLOW" "Крок 4: Публікація образу в Docker Hub"
if docker push "$FULL_IMAGE_NAME:latest"; then
    print_color "$GREEN" "✅ Образ успішно опублікований у Docker Hub"
    print_color "$GREEN" "🚀 Ваш образ доступний за адресою: https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME"
else
    print_color "$RED" "❌ Помилка під час публікації образу"
    exit 1
fi

# Показуємо команду для запуску
print_color "$GREEN" "$(cat <<EOF
🎉 Складання та публікація завершено успішно!
Для запуску вашої програми використовуйте:

1. Запустіть API сервер:
   docker run -d --name movies-api -p 8000:8000 webbylabhub/movies

2. Запустіть ваш додаток:
   docker run --name movies -p 3000:3000 -e API_URL=http://localhost:8000/api/v1 $FULL_IMAGE_NAME

Або використовуйте docker-compose:
   docker-compose up -d
EOF
)"
