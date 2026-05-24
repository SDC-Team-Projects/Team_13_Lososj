# API спецификация

## Общая информация

- Формат данных: JSON
- Протокол: HTTP
- Аутентификация: JWT (Bearer Token)
- Base URL: /api

---

##   Auth

### POST /auth/register
Регистрация пользователя

Request:
{
  "email": "user@mail.com",
  "password": "12345678",
  "username": "alex",
  "city": "Vilnius",
  "country": "Lithuania"
}

Response:
{
  "id": 1,
  "email": "user@mail.com",
  "username": "alex"
}

---

### POST /auth/login
Авторизация

Request:
{
  "email": "user@mail.com",
  "password": "12345678"
}

Response:
{
  "token": "jwt_token"
}

---

### POST /auth/logout
Выход из системы

Response:
{
  "message": "Logged out successfully"
}

---

##  Profile

### GET /profile
Получить профиль пользователя

Response:
{
  "id": 1,
  "email": "user@mail.com",
  "username": "alex",
  "city": "Vilnius",
  "country": "Lithuania",
  "created_at": "2026-01-15"
}

---

### PUT /profile
Обновить профиль

Request:
{
  "username": "alex_updated",
  "city": "Berlin",
  "country": "Germany"
}

---

### PUT /profile/password
Смена пароля (в целях безопасности аккаунта)

Request:
{
  "old_password": "12345678",
  "new_password": "newpassword123"
}

---

### POST /auth/password-reset/request
Запрос на смену пароля (пользователь его забыл)

Request:
{
  "email": "user@example.com"
}

Response:
{
  "message": "Password reset link sent"
}

---

### POST /auth/password-reset/confirm
Подтверждение смены пароля (пользователь его забыл)

Request:
{
  "token": "XYZ",
  "new_password": "newpassword123",
  "confirm_new_password": "newpassword123"
}

---

##  Collections

### GET /collections
Список коллекций пользователя

---

### POST /collections
Создать коллекцию

Request:
{
  "name": "Монеты",
  "description": "Коллекция монет",
  "category": "Нумизматика",
  "image": "collection.jpg",
  "is_public": true
}

---

### GET /collections/{id}
Получить коллекцию

---

### GET /collections/all
Получить всех коллекций на сайте для Overview

---

### PUT /collections/{id}
Обновить коллекцию

---

### DELETE /collections/{id}
Удалить коллекцию (реализовать для обычного пользователя и для модератора)

---

### GET /collections/public/{id}
Просмотр публичной коллекции

---

### GET /collections/{id}/export
Экспорт коллекции

Response:
{
  "file_url": "export.pdf"
}

---

##  Items

### GET /collections/{id}/items
Список предметов

Query параметры:
- search
- category
- min_price
- max_price

---

### POST /items
Создать предмет

Request:
{
  "collection_id": 1,
  "name": "Монета 1920",
  "description": "Редкая монета",
  "notes": "Куплена на аукционе",
  "condition": "good",
  "estimated_value": 100,
  "categories": [1, 2],
  "custom_fields": {
    "year": 1920
  }
}

---

### GET /items/{id}
Получить предмет

---

### PUT /items/{id}
Редактировать предмет

---

### DELETE /items/{id}
Удалить предмет (реализовать для обычного пользователя и для модератора)

---

##  Photos

### POST /items/{id}/photos
Добавить фото

Request:
{
  "url": "image.jpg"
}

---

### DELETE /photos/{id}
Удалить фото

---

##  Favorites

### POST /favorites/{item_id}
Добавить в избранное

---

### DELETE /favorites/{item_id}
Удалить из избранного

---

### GET /favorites
Список избранных предметов

---

### POST /favorites{collection_id}
Добавить коллекцию в избранное

---

### GET /favorites{collection_id}
Список избранных коллекций

---

### DELETE /favorites{collection_id}
Удалить коллекцию из избранного

---

##  Analytics

### GET /analytics/collection/{id}
Аналитика коллекции

Response:
{
  "total_value": 1000,
  "items_count": 10,
  "categories_distribution": [
    {
      "category": "Монеты",
      "count": 5
    }
  ]
}

---

### GET /analytics/user
Общая статистика пользователя

Response:
{
  "collections_count": 4,
  "items_count": 263,
  "total_value": 10000
}

---

##  Activity

### GET /activity
Последняя активность пользователя

Response:
[
  {
    "action": "added item",
    "item": "1924 Ruble",
    "date": "2026-04-05"
  }
]

---

##  Admin 

### POST /admin/users/{id}/ban
Блокировка пользователя

Request:
{
  "type": "temporary",
  "until": "2026-05-01"
}
