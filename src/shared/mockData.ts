import type {
  BlogPostPreview,
  CatalogItem,
  CmsPage,
  ContactInfo,
  DocumentItem,
  GalleryImage,
} from "./types";

export const mockCatalogItems: CatalogItem[] = [
  {
    id: "signal-controller",
    name: "Контроллеры и управляющие устройства",
    description: "Базовая категория каталога, приходящая из внешней системы.",
    price: "по запросу",
    category: "Каталог",
  },
  {
    id: "communication-devices",
    name: "Коммуникационные устройства",
    description: "Интеграционный раздел для оборудования связи и периферии.",
    price: "по запросу",
    category: "Каталог",
  },
  {
    id: "custom-kits",
    name: "Комплекты для индивидуальных заказов",
    description: "Специальные конфигурации под требования заказчика.",
    price: "по запросу",
    category: "Каталог",
  },
];

export const mockCmsPages: Record<string, CmsPage> = {
  home: {
    slug: "home",
    title: "ООО «ЭЛК»",
    lead: "Производственная компания с навигацией по табам, большим фоновым изображением и центральным контентным блоком.",
    body: [
      "Этот контент в реальном проекте должен редактироваться через CMS: вступительный текст, преимущества, SEO и блоки на главной.",
      "Фронтенд только получает готовые данные и отображает их. Источником правды становится CMS, а не код приложения.",
    ],
    seo: {
      title: "Главная | ООО «ЭЛК»",
      description: "Корпоративный сайт ООО «ЭЛК» на React и TypeScript.",
    },
  },
  about: {
    slug: "about",
    title: "О компании",
    lead: "Страница о компании может храниться в CMS вместе с SEO-полями и медиаматериалами.",
    body: [
      "Обычно в CMS для такой страницы лежат заголовок, вводный текст, несколько абзацев, изображения и метаданные для поисковиков.",
      "Если редактору нужно поменять формулировку или загрузить новую фотографию, он делает это в админке без участия разработчика.",
    ],
    seo: {
      title: "О компании | ООО «ЭЛК»",
      description: "Информация о компании и подходе к управлению контентом.",
    },
  },
};

export const mockGalleryImages: GalleryImage[] = [
  { id: "g1", title: "Переговорная", imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80" },
  { id: "g2", title: "Презентация", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80" },
  { id: "g3", title: "Рабочее место", imageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80" },
  { id: "g4", title: "Плата", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: "g5", title: "Лаборатория", imageUrl: "https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=900&q=80" },
  { id: "g6", title: "Монтаж", imageUrl: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=900&q=80" },
];

export const mockDocuments: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Сертификат соответствия ISO 9001",
    description: "Основной сертификат компании.",
    fileUrl: "#",
    category: "Сертификаты",
  },
  {
    id: "doc-2",
    title: "Карточка предприятия",
    description: "Банковские реквизиты и регистрационные данные.",
    fileUrl: "#",
    category: "Реквизиты",
  },
  {
    id: "doc-3",
    title: "Политика в области качества",
    description: "Внутренний документ для партнеров и заказчиков.",
    fileUrl: "#",
    category: "Документы",
  },
];

export const mockBlogPosts: BlogPostPreview[] = [
  {
    id: "post-1",
    title: "Мобильный тестер БУЭВ",
    excerpt: "Материал о диагностическом оборудовании и его применении в эксплуатации пассажирских вагонов.",
    publishedAt: "2026-01-20",
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "post-2",
    title: "Мобильный тестер РТС вагона",
    excerpt: "Обзор прибора для проверки и комплексного тестирования системы оповещения.",
    publishedAt: "2026-06-22",
    imageUrl: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=900&q=80",
  },
];

export const mockContacts: ContactInfo = {
  phones: ["+7 (4822) 42-08-83", "+7 (920) 172-48-04", "+7 (930) 181-30-55"],
  email: "mail@nev.elk.com.ru",
  address: "170001, Россия, Тверь, улица Двор Пролетарки, дом 19, помещение III",
  mapImageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80",
  officeImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
};
