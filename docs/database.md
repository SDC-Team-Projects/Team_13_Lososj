# Схема базы данных

## ER-диаграмма

Диаграмма базы данных создана с использованием dbdiagram.io.

<img width="1632" height="858" alt="image" src="https://github.com/user-attachments/assets/4110c4c0-60b1-4a41-80e3-a0e6d13e7966" />


---

## Описание таблиц

### Users
Хранит информацию о пользователях системы.

Поля:
- id (PK) — уникальный идентификатор
- email — электронная почта
- password — пароль
- username — имя пользователя
- city — город
- country — страна
- role — роль (USER / ADMIN)
- status — статус (active / banned)
- created_at — дата регистрации

---

### Collections
Коллекции пользователя.

Поля:
- id (PK)
- user_id (FK → Users.id)
- name — название коллекции
- description — описание
- category — категория коллекции
- image — изображение коллекции
- is_public — публичная ли коллекция
- created_at — дата создания

Связь:
- Один пользователь → много коллекций (1:N)

---

### Items
Предметы в коллекции.

Поля:
- id (PK)
- collection_id (FK → Collections.id)
- name — название
- description — описание
- notes — заметки
- condition — состояние
- estimated_value — стоимость
- custom_fields (JSONB) — дополнительные поля
- created_at — дата добавления

Связь:
- Одна коллекция → много предметов (1:N)

---

### Photos
Фотографии предметов.

Поля:
- id (PK)
- item_id (FK → Items.id)
- url — ссылка на изображение

Связь:
- Один предмет → много фото (1:N)

---

### Categories
Категории предметов.

Поля:
- id (PK)
- name — название категории

---

### Item_Categories
Связующая таблица (many-to-many).

Поля:
- item_id (FK → Items.id)
- category_id (FK → Categories.id)

Связь:
- Один предмет ↔ много категорий
- Одна категория ↔ много предметов (M:N)

---

### Favorites
Избранные предметы пользователя.

Поля:
- id (PK)
- user_id (FK → Users.id)
- item_id (FK → Items.id)

Связь:
- Пользователь ↔ предметы (M:N)

---

### Notifications
Уведомления пользователя.

Поля:
- id (PK)
- user_id (FK → Users.id)
- message — текст уведомления
- is_read — прочитано ли уведомление
- created_at — дата создания

Связь:
- Один пользователь → много уведомлений (1:N)

---

## Связи между таблицами

- Users → Collections (1:N)
- Collections → Items (1:N)
- Items → Photos (1:N)
- Items ↔ Categories (M:N)
- Users ↔ Items (M:N через Favorites)
- Users → Notifications (1:N)

---

## Особенности

- Используется JSONB для динамических полей
- Поддержка публичных коллекций
- Реализованы связи 1:N и M:N
- Поддержка избранных предметов
- Поддержка уведомлений
- Возможность блокировки пользователей
