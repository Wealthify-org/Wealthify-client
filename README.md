# Wealthify — Frontend

Веб-клиент платформы для отслеживания инвестиционных портфелей с
ИИ-аналитикой. Клиент к [Wealthify-backend](../Wealthify-backend/).

## Стек

- **Next.js 15** (App Router) + **React 19**
- **TypeScript**, **CSS Modules**
- **MobX** для клиентского state-management (token store, user store,
  favorites, фильтры)
- **next-intl** — i18n (RU / EN)
- **react-hook-form** + **zod** — формы и валидация
- **recharts** — графики
- **react-markdown** — рендер ответов ИИ-чата

## Возможности

- Дашборд портфеля: позиции, прибыль, диверсификация, графики стоимости
- Каталог криптоактивов с поиском, избранным, фильтрами по категориям
- Тест риск-профиля + персонализированные рекомендации портфеля
- ИИ-чат с контекстом портфеля
- Многоязычный интерфейс (RU/EN), light/dark тема (system-preference)

## Быстрый старт через Docker

**Самый простой способ** — поднять весь стек (фронт + бэк + БД + RabbitMQ)
из бэкенд-репо. См. [Wealthify-backend/README.md](../Wealthify-backend/README.md).

Кратко:

```bash
mkdir wealthify && cd wealthify
git clone <Wealthify-backend-url>
git clone <wealthify-web-url>
cd Wealthify-backend
docker compose -f docker-compose.dev.yml up -d --build
```

После этого:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

При первом запуске Postgres ~1-2 минуты разворачивает seed (≈110 крипто-активов
с графиками). Дождитесь `database system is ready to accept connections`.

## Запуск только фронта (бэк уже работает где-то)

Если бэк поднят отдельно (например, на удалённом сервере), фронт можно
запустить локально:

```bash
npm ci
npm run dev
```

Откроется на http://localhost:3000.

По умолчанию ходит на `http://localhost:5001` (см. `src/lib/apiEndpoints.ts`).
Для смены — переменные окружения:

| Var | Когда используется | Дефолт |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Браузер → backend | `http://localhost:5001` |
| `INTERNAL_API_URL` | SSR-роуты (`/api/auth/refresh` и др.) → backend | то же что и public |

В Docker-режиме `INTERNAL_API_URL=http://api-gateway:5001` (внутреннее имя
сети), `NEXT_PUBLIC_API_URL=http://localhost:5001` (адрес для браузера).

## Сборка для production

```bash
npm run build
npm start
```

## Скрипты

```bash
npm run dev      # next dev на :3000
npm run build    # next build
npm start        # next start (после build)
npm run lint     # eslint
```

## Структура

```
src/
├── app/                  ← Next.js App Router
│   ├── (onboarding)/     ← группа маршрутов с лендингом и параллельными модалками
│   ├── auth/             ← страницы sign-in/sign-up (без модалки)
│   ├── portfolios/       ← дашборд портфелей
│   ├── assets/[ticker]/  ← страница конкретного актива
│   └── api/auth/         ← server-side прокси для /refresh и /logout
├── components/           ← UI-компоненты по доменам
├── stores/               ← MobX-сторы + провайдеры
├── lib/                  ← apiEndpoints, routes, types, auth-helpers
└── hooks/                ← useDebouncedValue, useBodyScrollLock
messages/                 ← i18n-словари (en.json, ru.json)
```

## Архитектурные особенности

- **Auth flow:** access-token живёт в памяти (`tokenStore`), refresh-token —
  в HttpOnly-cookie на домене Next.js. На mount `AppProviders` вызывает
  `/api/auth/refresh` (Next-роут) который форвардит refresh-cookie на
  backend gateway, получает новый access-token и user'а.
- **Single-flight refresh:** `tokenStore` дедуплицирует одновременные
  запросы на refresh — пять параллельных fetch'ей с истёкшим токеном
  отдадут один HTTP-запрос на refresh.
- **Auto-refresh:** новый access-token регистрирует таймер на refresh за
  30с до истечения (с минимумом 5с от текущего момента).
- **i18n:** ключи в `messages/{en,ru}.json`. Обращения через
  `useTranslations("namespace")`.

## Лицензия / контекст

Проект — выпускная работа МГТУ «СТАНКИН». Не для коммерческого использования.
