# ELK Site

Корпоративный сайт ООО «ЭЛК» на `React + Vite + TypeScript` с собственной CMS-админкой на `NestJS + PostgreSQL + Prisma`.

Пакетный менеджер проекта: `yarn`.

## Что внутри

- `React SPA` на `Vite`
- `TypeScript`
- `React Router` для табовой навигации
- `TanStack Query` для загрузки и кэширования данных
- публичный сайт читает только опубликованный CMS-контент
- админка `/admin` работает после входа и поддерживает черновики/публикацию
- backend в `server/` хранит контент, пользователей и медиатеку
- стартовые маршруты:
  - `/`
  - `/catalog`
  - `/gallery`
  - `/documents`
  - `/blog`
  - `/contacts`

## Как в проекте хранится контент

В этом проекте контент делится на 2 источника:

- каталог приходит из внешней системы по API
- остальной сайт хранится в CMS

Под CMS здесь понимается `Content Management System`, то есть админка, в которой менеджер или контент-редактор может менять тексты, загружать изображения, добавлять новости, документы и контакты без участия разработчика.

В типовом варианте в CMS будут жить:

- страницы и SEO-поля
- галерея
- документы и ссылки на файлы
- блог
- контакты

Фронтенд получает эти данные через HTTP API и отображает их. Источником правды для контента становится PostgreSQL через backend CMS, а не код в репозитории.

## Архитектурное решение

Каталог не редактируется в CMS и остается внешней системой. Фронтенд работает с двумя источниками:

- API внешней системы каталога
- API собственной CMS для текстов, SEO, галереи, документов, блога и контактов

Backend CMS находится в `server/` и дает:

- авторизацию через `JWT` в `httpOnly` cookie
- хранение контента в `PostgreSQL`
- черновики и публикацию
- загрузку файлов в `server/uploads`

## Запуск frontend

```bash
yarn install
yarn dev
```

## Запуск backend CMS

```bash
cd server
yarn install
cp .env.example .env
yarn prisma:generate
yarn prisma:migrate
yarn prisma:seed
yarn dev
```

После этого для frontend нужно задать:

```bash
VITE_CMS_API_BASE=http://127.0.0.1:3001/api
```

Стартовый админ создается из переменных `ADMIN_LOGIN` и `ADMIN_PASSWORD` в `server/.env`.

## Переменные окружения

- `VITE_CATALOG_API_BASE` - базовый URL внешнего API каталога
- `VITE_CMS_API_BASE` - базовый URL backend CMS, например `http://127.0.0.1:3001/api`

## Каталог

Публичный каталог работает через backend сайта. Браузер не обращается к внешнему Frappe API напрямую.

Backend-настройки в `server/.env`:

- `CATALOG_API_BASE` - базовый URL внешнего сервиса
- `CATALOG_API_METHOD_PREFIX` - prefix Frappe method path
- `CATALOG_API_KEY` - API key внешнего сервиса
- `CATALOG_API_SECRET` - API secret внешнего сервиса
- `CATALOG_CACHE_TTL_MS` - TTL cache для тяжелых сборок каталога

Blacklist категорий редактируется в `/admin` в разделе `Каталог` и публикуется отдельно от черновика.
