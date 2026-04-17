# API спецификация

## Общая информация

- Формат данных: JSON
- Протокол: HTTP
- Аутентификация: JWT

---

## Auth

### POST /auth/register
Регистрация пользователя

Request:
{
  "email": "user@mail.com",
  "password": "123456"
}

Response:
{
  "id": 1,
  "email": "user@mail.com"
}

---

### POST /auth/login
Авторизация

Request:
{
  "email": "user@mail.com",
  "password": "123456"
}

Response:
{
  "token": "jwt_token"
}

---

## Collections

### GET /collections
Получить список коллекций пользователя

---

### POST /collections
Создать коллекцию

Request:
{
  "name": "Монеты",
  "description": "Коллекция монет"
}

---

### GET /collections/{id}
Получить коллекцию

---

### DELETE /collections/{id}
Удалить коллекцию

---

## Items

### GET /collections/{id}/items
Список предметов коллекции

---

### POST /items
Создать предмет

Request:
{
  "collection_id": 1,
  "name": "Монета 1920",
  "condition": "good",
  "estimated_value": 100,
  "custom_fields": {
    "year": 1920
  }
}

---

### GET /items/{id}
Получить предмет

---

### DELETE /items/{id}
Удалить предмет

---

## Photos

### POST /items/{id}/photos
Добавить фото

Request:
{
  "url": "image.jpg"
}

---

## Analytics

### GET /analytics/collection/{id}
Получить аналитику по коллекции

Response:
{
  "total_value": 1000,
  "items_count": 10,
  "categories_distribution": [
  { "category": "Монеты", "count": 5 }
]
}
