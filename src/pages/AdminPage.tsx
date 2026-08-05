import { useEffect, useMemo, useState } from "react";
import {
  useAdminContent,
  useAdminMe,
  useCreateBlog,
  useCreateDocumentItem,
  useCreateGalleryImage,
  useDeleteBlog,
  useDeleteDocumentItem,
  useDeleteGalleryImage,
  useLoginAdmin,
  useLogoutAdmin,
  useMediaAssets,
  usePublishBlog,
  usePublishContacts,
  usePublishDocumentItem,
  usePublishGalleryImage,
  usePublishHome,
  usePublishPage,
  useReorderDocumentItems,
  useReorderGalleryImages,
  useSaveBlogDraft,
  useSaveContactsDraft,
  useSaveDocumentItem,
  useSaveGalleryImage,
  useSaveHomeDraft,
  useSavePageDraft,
  useUploadMediaAsset,
} from "../features/cms/hooks";
import {
  useAdminCatalogSettings,
  usePublishAdminCatalogSettings,
  useSaveAdminCatalogSettingsDraft,
} from "../features/catalog/hooks";
import { appConfig } from "../shared/config";
import type {
  BlogPost,
  CatalogCategory,
  CatalogSettings,
  CmsContent,
  CmsPage,
  ContactInfo,
  DocumentItem,
  GalleryImage,
  HomeCard,
  MediaAsset,
} from "../shared/types";
import { ContentState } from "../ui/ContentState";
import { SystemErrorScreen } from "../ui/SystemScreen";

type AdminSection = "overview" | "pages" | "home" | "catalog" | "blog" | "gallery" | "documents" | "contacts" | "media";

const pageOptions = [
  { slug: "home", label: "Главная" },
  { slug: "about", label: "О компании" },
  { slug: "installation", label: "Монтаж" },
  { slug: "techcontrol", label: "Техконтроль" },
  { slug: "service", label: "Сервис" },
];

const adminSections: Array<{ id: AdminSection; label: string; hint: string }> = [
  { id: "overview", label: "Обзор", hint: "статус и быстрые действия" },
  { id: "pages", label: "Страницы", hint: "тексты, SEO и изображения" },
  { id: "home", label: "Главная", hint: "преимущества и карточки" },
  { id: "catalog", label: "Каталог", hint: "скрытие категорий" },
  { id: "blog", label: "Блог", hint: "материалы и публикации" },
  { id: "gallery", label: "Галерея", hint: "фотографии и подписи" },
  { id: "documents", label: "Документы", hint: "файлы и категории" },
  { id: "contacts", label: "Контакты", hint: "телефоны, карта, адрес" },
  { id: "media", label: "Медиатека", hint: "загрузка файлов" },
];

function cloneContent(content: CmsContent): CmsContent {
  return JSON.parse(JSON.stringify(content)) as CmsContent;
}

function createId(prefix: string) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${randomPart}`;
}

function slugify(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[а-я]/g, (letter) => {
      const map: Record<string, string> = {
        а: "a",
        б: "b",
        в: "v",
        г: "g",
        д: "d",
        е: "e",
        ж: "zh",
        з: "z",
        и: "i",
        й: "y",
        к: "k",
        л: "l",
        м: "m",
        н: "n",
        о: "o",
        п: "p",
        р: "r",
        с: "s",
        т: "t",
        у: "u",
        ф: "f",
        х: "h",
        ц: "c",
        ч: "ch",
        ш: "sh",
        щ: "sch",
        ы: "y",
        э: "e",
        ю: "yu",
        я: "ya",
      };

      return map[letter] ?? "";
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || `material-${Date.now().toString(36)}`;
}

function linesToText(items: string[] = []) {
  return items.join("\n");
}

function paragraphsToText(items: string[] = []) {
  return items.join("\n\n");
}

function textToLines(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function textToParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fileSize(size: number) {
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} КБ`;
  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
}

function cloneCatalogSettings(settings: CatalogSettings): CatalogSettings {
  return {
    hiddenLevel1: [...settings.hiddenLevel1],
    hiddenLevel2: [...settings.hiddenLevel2],
  };
}

const IMAGE_HINTS = {
  hero: "Поддерживаются JPG, PNG и WebP. Ссылка должна вести прямо на файл изображения. Для широких блоков лучше использовать картинку от 1600x900 px.",
  card: "Поддерживаются JPG, PNG и WebP. Лучше использовать изображение не меньше 1200x900 px, чтобы карточка выглядела четко на десктопе.",
  galleryThumb: "Поддерживаются JPG, PNG и WebP. Для миниатюры лучше использовать изображение от 800x600 px с аккуратным кадрированием.",
  galleryFull: "Поддерживаются JPG, PNG и WebP. Для полноэкранного просмотра лучше использовать изображение от 1600x1200 px.",
  documentPreview: "Поддерживаются JPG, PNG и WebP. Для превью документа лучше использовать вертикальное изображение от 1200 px по ширине или скрин первой страницы PDF.",
} as const;

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "password" | "url" | "date";
  hint?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      {hint ? <small className="admin-field__hint">{hint}</small> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SectionActions({
  saveLabel = "Сохранить черновик",
  publishLabel = "Опубликовать",
  onSave,
  onPublish,
  busy,
}: {
  saveLabel?: string;
  publishLabel?: string;
  onSave: () => void;
  onPublish: () => void;
  busy?: boolean;
}) {
  return (
    <div className="admin-section-actions">
      <button type="button" className="admin-button admin-button--secondary" onClick={onSave} disabled={busy}>
        {saveLabel}
      </button>
      <button type="button" className="admin-button admin-button--primary" onClick={onPublish} disabled={busy}>
        {publishLabel}
      </button>
    </div>
  );
}

function EntityList<T extends { id: string; title: string }>({
  items,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onMove,
  addLabel,
}: {
  items: T[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onMove?: (id: string, direction: -1 | 1) => void;
  addLabel: string;
}) {
  return (
    <aside className="admin-entity-list" aria-label="Список записей">
      <button type="button" className="admin-button admin-button--primary admin-button--full" onClick={onCreate}>
        {addLabel}
      </button>
      <div className="admin-entity-list__items">
        {items.map((item, index) => (
          <div key={item.id} className={item.id === activeId ? "admin-entity admin-entity--active" : "admin-entity"}>
            <button type="button" onClick={() => onSelect(item.id)}>
              <strong>{item.title || "Без названия"}</strong>
              <span>ID: {item.id}</span>
            </button>
            <div className="admin-entity__actions">
              {onMove ? (
                <>
                  <button type="button" onClick={() => onMove(item.id, -1)} disabled={index === 0}>
                    ↑
                  </button>
                  <button type="button" onClick={() => onMove(item.id, 1)} disabled={index === items.length - 1}>
                    ↓
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => onDelete(item.id)} aria-label={`Удалить ${item.title}`}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function AdminLogin() {
  const loginMutation = useLoginAdmin();
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("");

  return (
    <div className="admin-auth">
      <form
        className="admin-auth__card"
        onSubmit={(event) => {
          event.preventDefault();
          loginMutation.mutate({ login, password });
        }}
      >
        <div>
          <p className="admin-kicker">CMS ООО «ЭЛК»</p>
          <h1>Вход в админку</h1>
          <p>После входа можно редактировать черновики, публиковать изменения и загружать файлы.</p>
        </div>
        <Field label="Логин" value={login} onChange={setLogin} />
        <Field label="Пароль" value={password} onChange={setPassword} type="password" />
        <button type="submit" className="admin-button admin-button--primary" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Проверяем..." : "Войти"}
        </button>
        {loginMutation.isError ? <p className="admin-error">Не удалось войти. Проверь логин и пароль.</p> : null}
        {!appConfig.cmsApiBase ? (
          <p className="admin-note">Backend API не задан, поэтому включен dev fallback с localStorage.</p>
        ) : null}
      </form>
    </div>
  );
}

export function AdminPage() {
  const meQuery = useAdminMe();
  const isAuthorized = Boolean(meQuery.data);

  if (meQuery.isLoading) {
    return <ContentState>Проверяем сессию...</ContentState>;
  }

  if (meQuery.isError) {
    return <SystemErrorScreen title="Не удалось проверить сессию админки" lead="Сервер авторизации временно недоступен. Попробуйте обновить страницу немного позже." />;
  }

  if (!isAuthorized) {
    return <AdminLogin />;
  }

  return <AdminWorkspace />;
}

function AdminWorkspace() {
  const adminContentQuery = useAdminContent(true);
  const adminCatalogQuery = useAdminCatalogSettings(true);
  const mediaQuery = useMediaAssets(Boolean(appConfig.cmsApiBase));
  const logoutMutation = useLogoutAdmin();
  const savePageDraft = useSavePageDraft();
  const publishPage = usePublishPage();
  const saveHomeDraft = useSaveHomeDraft();
  const publishHome = usePublishHome();
  const saveBlogDraft = useSaveBlogDraft();
  const publishBlog = usePublishBlog();
  const createBlog = useCreateBlog();
  const deleteBlog = useDeleteBlog();
  const saveGalleryImage = useSaveGalleryImage();
  const publishGalleryImage = usePublishGalleryImage();
  const createGalleryImage = useCreateGalleryImage();
  const deleteGalleryImage = useDeleteGalleryImage();
  const reorderGalleryImages = useReorderGalleryImages();
  const saveDocumentItem = useSaveDocumentItem();
  const publishDocumentItem = usePublishDocumentItem();
  const createDocumentItem = useCreateDocumentItem();
  const deleteDocumentItem = useDeleteDocumentItem();
  const reorderDocumentItems = useReorderDocumentItems();
  const saveContactsDraft = useSaveContactsDraft();
  const publishContacts = usePublishContacts();
  const uploadMedia = useUploadMediaAsset();
  const saveCatalogSettingsDraft = useSaveAdminCatalogSettingsDraft();
  const publishCatalogSettings = usePublishAdminCatalogSettings();

  const [section, setSection] = useState<AdminSection>("overview");
  const [draft, setDraft] = useState<CmsContent | null>(null);
  const [selectedPage, setSelectedPage] = useState("home");
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [catalogSettings, setCatalogSettings] = useState<CatalogSettings | null>(null);
  const [status, setStatus] = useState("Готово к работе");

  useEffect(() => {
    if (adminContentQuery.data) {
      const next = cloneContent(adminContentQuery.data);
      setDraft(next);
      setSelectedBlog((current) => current ?? next.blogPosts[0]?.id ?? null);
      setSelectedGallery((current) => current ?? next.galleryImages[0]?.id ?? null);
      setSelectedDocument((current) => current ?? next.documents[0]?.id ?? null);
    }
  }, [adminContentQuery.data]);

  useEffect(() => {
    if (adminCatalogQuery.data?.settings) {
      setCatalogSettings(cloneCatalogSettings(adminCatalogQuery.data.settings));
    }
  }, [adminCatalogQuery.data]);

  const selectedPageData = draft?.pages[selectedPage] ?? null;
  const selectedBlogData = draft?.blogPosts.find((post) => post.id === selectedBlog) ?? null;
  const selectedGalleryData = draft?.galleryImages.find((image) => image.id === selectedGallery) ?? null;
  const selectedDocumentData = draft?.documents.find((document) => document.id === selectedDocument) ?? null;
  const busy =
    savePageDraft.isPending ||
    publishPage.isPending ||
    saveHomeDraft.isPending ||
    publishHome.isPending ||
    saveBlogDraft.isPending ||
    publishBlog.isPending ||
    createBlog.isPending ||
    deleteBlog.isPending ||
    saveGalleryImage.isPending ||
    publishGalleryImage.isPending ||
    createGalleryImage.isPending ||
    deleteGalleryImage.isPending ||
    reorderGalleryImages.isPending ||
    saveDocumentItem.isPending ||
    publishDocumentItem.isPending ||
    createDocumentItem.isPending ||
    deleteDocumentItem.isPending ||
    reorderDocumentItems.isPending ||
    saveContactsDraft.isPending ||
    publishContacts.isPending ||
    uploadMedia.isPending ||
    saveCatalogSettingsDraft.isPending ||
    publishCatalogSettings.isPending;

  const summary = useMemo(() => {
    if (!draft) return [];

    return [
      { label: "Страниц", value: Object.keys(draft.pages).length },
      { label: "Записей блога", value: draft.blogPosts.length },
      { label: "Фото в галерее", value: draft.galleryImages.length },
      { label: "Документов", value: draft.documents.length },
    ];
  }, [draft]);

  const updateDraft = (recipe: (content: CmsContent) => void) => {
    setDraft((current) => {
      if (!current) return current;
      const next = cloneContent(current);
      recipe(next);
      return next;
    });
  };

  const runAction = async (message: string, action: () => Promise<unknown>) => {
    try {
      setStatus("Сохраняем...");
      await action();
      setStatus(message);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "неизвестная ошибка";
      setStatus(`Ошибка: ${detail}`);
    }
  };

  const saveCurrentPage = async () => {
    if (!draft || !selectedPageData) return;
    await runAction("Черновик страницы сохранен", () =>
      savePageDraft.mutateAsync({ slug: selectedPage, page: selectedPageData, content: draft }),
    );
  };

  const publishCurrentPage = async () => {
    if (!draft || !selectedPageData) return;
    await runAction("Страница опубликована", async () => {
      await savePageDraft.mutateAsync({ slug: selectedPage, page: selectedPageData, content: draft });
      await publishPage.mutateAsync(selectedPage);
    });
  };

  const saveHome = async () => {
    if (!draft) return;
    await runAction("Черновик главной сохранен", () =>
      saveHomeDraft.mutateAsync({
        payload: { homeFeatures: draft.homeFeatures, homeCards: draft.homeCards },
        content: draft,
      }),
    );
  };

  const publishHomeContent = async () => {
    if (!draft) return;
    await runAction("Главная опубликована", async () => {
      await saveHomeDraft.mutateAsync({
        payload: { homeFeatures: draft.homeFeatures, homeCards: draft.homeCards },
        content: draft,
      });
      await publishHome.mutateAsync();
    });
  };

  const saveCurrentBlog = async () => {
    if (!draft || !selectedBlogData) return;
    await runAction("Черновик записи сохранен", () =>
      saveBlogDraft.mutateAsync({ id: selectedBlogData.id, post: selectedBlogData, content: draft }),
    );
  };

  const publishCurrentBlog = async () => {
    if (!draft || !selectedBlogData) return;
    await runAction("Запись опубликована", async () => {
      await saveBlogDraft.mutateAsync({ id: selectedBlogData.id, post: selectedBlogData, content: draft });
      await publishBlog.mutateAsync(selectedBlogData.id);
    });
  };

  const saveCurrentGallery = async () => {
    if (!draft || !selectedGalleryData) return;
    await runAction("Фото сохранено", () =>
      saveGalleryImage.mutateAsync({ id: selectedGalleryData.id, image: selectedGalleryData, content: draft }),
    );
  };

  const publishCurrentGallery = async () => {
    if (!draft || !selectedGalleryData) return;
    await runAction("Фото опубликовано", async () => {
      await saveGalleryImage.mutateAsync({ id: selectedGalleryData.id, image: selectedGalleryData, content: draft });
      await publishGalleryImage.mutateAsync(selectedGalleryData.id);
    });
  };

  const saveCurrentDocument = async () => {
    if (!draft || !selectedDocumentData) return;
    await runAction("Документ сохранен", () =>
      saveDocumentItem.mutateAsync({ id: selectedDocumentData.id, document: selectedDocumentData, content: draft }),
    );
  };

  const publishCurrentDocument = async () => {
    if (!draft || !selectedDocumentData) return;
    await runAction("Документ опубликован", async () => {
      await saveDocumentItem.mutateAsync({ id: selectedDocumentData.id, document: selectedDocumentData, content: draft });
      await publishDocumentItem.mutateAsync(selectedDocumentData.id);
    });
  };

  const saveContacts = async () => {
    if (!draft) return;
    await runAction("Черновик контактов сохранен", () =>
      saveContactsDraft.mutateAsync({ contacts: draft.contacts, content: draft }),
    );
  };

  const publishContactsContent = async () => {
    if (!draft) return;
    await runAction("Контакты опубликованы", async () => {
      await saveContactsDraft.mutateAsync({ contacts: draft.contacts, content: draft });
      await publishContacts.mutateAsync();
    });
  };

  const saveCatalogSettings = async () => {
    if (!catalogSettings) return;
    await runAction("Черновик настроек каталога сохранен", () =>
      saveCatalogSettingsDraft.mutateAsync(catalogSettings),
    );
  };

  const publishCatalogSettingsContent = async () => {
    if (!catalogSettings) return;
    await runAction("Настройки каталога опубликованы", async () => {
      await saveCatalogSettingsDraft.mutateAsync(catalogSettings);
      await publishCatalogSettings.mutateAsync();
    });
  };

  const addBlog = async () => {
    if (!draft) return;
    const title = "Новая запись";
    const post: BlogPost = {
      id: createId("post"),
      slug: slugify(title),
      title,
      excerpt: "Краткое описание материала.",
      publishedAt: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
      imageUrl: "",
      tags: [],
      body: ["Основной текст материала."],
    };
    const next = { ...draft, blogPosts: [...draft.blogPosts, post] };
    setDraft(next);
    setSelectedBlog(post.id);
    await runAction("Запись создана", () => createBlog.mutateAsync({ post, content: next }));
  };

  const removeBlog = async (id: string) => {
    if (!draft) return;
    const nextPosts = draft.blogPosts.filter((post) => post.id !== id);
    const next = { ...draft, blogPosts: nextPosts };
    setDraft(next);
    setSelectedBlog(nextPosts[0]?.id ?? null);
    await runAction("Запись удалена", () => deleteBlog.mutateAsync({ id, content: next }));
  };

  const addGallery = async () => {
    if (!draft) return;
    const image: GalleryImage = {
      id: createId("gallery"),
      title: "Новая фотография",
      imageUrl: "",
      fullImageUrl: "",
    };
    const next = { ...draft, galleryImages: [...draft.galleryImages, image] };
    setDraft(next);
    setSelectedGallery(image.id);
    await runAction("Фото добавлено", () => createGalleryImage.mutateAsync({ image, content: next }));
  };

  const removeGallery = async (id: string) => {
    if (!draft) return;
    const nextImages = draft.galleryImages.filter((image) => image.id !== id);
    const next = { ...draft, galleryImages: nextImages };
    setDraft(next);
    setSelectedGallery(nextImages[0]?.id ?? null);
    await runAction("Фото удалено", () => deleteGalleryImage.mutateAsync({ id, content: next }));
  };

  const addDocument = async () => {
    if (!draft) return;
    const document: DocumentItem = {
      id: createId("doc"),
      title: "Новый документ",
      description: "Описание документа.",
      fileUrl: "",
      previewUrl: "",
      category: "Документы",
    };
    const next = { ...draft, documents: [...draft.documents, document] };
    setDraft(next);
    setSelectedDocument(document.id);
    await runAction("Документ добавлен", () => createDocumentItem.mutateAsync({ document, content: next }));
  };

  const removeDocument = async (id: string) => {
    if (!draft) return;
    const nextDocuments = draft.documents.filter((document) => document.id !== id);
    const next = { ...draft, documents: nextDocuments };
    setDraft(next);
    setSelectedDocument(nextDocuments[0]?.id ?? null);
    await runAction("Документ удален", () => deleteDocumentItem.mutateAsync({ id, content: next }));
  };

  const moveItem = async (collection: "galleryImages" | "documents", id: string, direction: -1 | 1) => {
    if (!draft) return;

    const next = cloneContent(draft);
    const items = [...next[collection]];
    const index = items.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;

    const [item] = items.splice(index, 1);
    items.splice(nextIndex, 0, item);
    if (collection === "galleryImages") {
      next.galleryImages = items as GalleryImage[];
      setDraft(next);
      await runAction("Порядок галереи сохранен", () =>
        reorderGalleryImages.mutateAsync({ ids: next.galleryImages.map((image) => image.id), content: next }),
      );
      return;
    }

    next.documents = items as DocumentItem[];
    setDraft(next);
    await runAction("Порядок документов сохранен", () =>
      reorderDocumentItems.mutateAsync({ ids: next.documents.map((document) => document.id), content: next }),
    );
  };

  if (adminContentQuery.isLoading || !draft) {
    return <ContentState>Загружаем CMS...</ContentState>;
  }

  if (adminContentQuery.isError) {
    return <SystemErrorScreen title="Не удалось открыть админку" lead="Рабочая среда CMS не загрузилась. Попробуйте обновить страницу или войти позже." />;
  }

  if (section === "catalog" && adminCatalogQuery.isError) {
    return <SystemErrorScreen title="Не удалось загрузить настройки каталога" lead="Раздел каталога временно недоступен. Попробуйте обновить страницу или открыть его позже." />;
  }

  return (
    <div className="admin-app" data-section={section}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <p className="admin-kicker">CMS</p>
          <h1>Контент сайта</h1>
        </div>
        <nav className="admin-nav" aria-label="Разделы админки">
          {adminSections.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === section ? "admin-nav__button admin-nav__button--active" : "admin-nav__button"}
              onClick={() => setSection(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="admin-button admin-button--secondary admin-button--full"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          Выйти
        </button>
      </aside>

      <main className="admin-workspace">
        <header className="admin-topline">
          <div>
            <p className="admin-kicker">Рабочее пространство</p>
            <h2>{adminSections.find((item) => item.id === section)?.label}</h2>
          </div>
          <div className={status.startsWith("Ошибка") ? "admin-save-state admin-save-state--error" : "admin-save-state"}>
            {busy ? "Выполняем действие..." : status}
          </div>
        </header>

        {section === "overview" ? (
          <section className="admin-panel admin-panel--overview">
            <div className="admin-overview-grid">
              {summary.map((item) => (
                <div key={item.label} className="admin-stat">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="admin-guidance">
              <h3>Как работает публикация</h3>
              <p>
                Кнопка «Сохранить черновик» обновляет рабочую версию в CMS. Публичный сайт увидит изменения только после
                «Опубликовать».
              </p>
              <p>
                Каталог в эту админку не включен: он остается отдельной внешней системой и подключается через свой API.
              </p>
            </div>
          </section>
        ) : null}

        {section === "pages" && selectedPageData ? (
          <section className="admin-panel">
            <div className="admin-tabs">
              {pageOptions.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  className={page.slug === selectedPage ? "admin-tab admin-tab--active" : "admin-tab"}
                  onClick={() => setSelectedPage(page.slug)}
                >
                  {page.label}
                </button>
              ))}
            </div>
            <PageEditor
              page={selectedPageData}
              onChange={(page) => updateDraft((content) => {
                content.pages[selectedPage] = page;
              })}
            />
            <SectionActions onSave={saveCurrentPage} onPublish={publishCurrentPage} busy={busy} />
          </section>
        ) : null}

        {section === "home" ? (
          <section className="admin-panel">
            <HomeEditor
              features={draft.homeFeatures}
              cards={draft.homeCards}
              onFeaturesChange={(homeFeatures) => updateDraft((content) => {
                content.homeFeatures = homeFeatures;
              })}
              onCardsChange={(homeCards) => updateDraft((content) => {
                content.homeCards = homeCards;
              })}
            />
            <SectionActions onSave={saveHome} onPublish={publishHomeContent} busy={busy} />
          </section>
        ) : null}

        {section === "catalog" ? (
          <section className="admin-panel">
            {adminCatalogQuery.isLoading || !catalogSettings ? (
              <ContentState>Загружаем настройки каталога...</ContentState>
            ) : null}
            {!adminCatalogQuery.isLoading && !adminCatalogQuery.isError && catalogSettings ? (
              <>
                <CatalogSettingsEditor
                  settings={catalogSettings}
                  publishedSettings={adminCatalogQuery.data?.publishedSettings}
                  categories={adminCatalogQuery.data?.categories ?? []}
                  catalogError={adminCatalogQuery.data?.catalogError}
                  onChange={setCatalogSettings}
                />
                <SectionActions onSave={saveCatalogSettings} onPublish={publishCatalogSettingsContent} busy={busy} />
              </>
            ) : null}
          </section>
        ) : null}

        {section === "blog" ? (
          <section className="admin-panel admin-two-column">
            <EntityList
              items={draft.blogPosts}
              activeId={selectedBlog}
              onSelect={setSelectedBlog}
              onCreate={addBlog}
              onDelete={removeBlog}
              addLabel="Добавить запись"
            />
            {selectedBlogData ? (
              <div>
                <BlogEditor
                  post={selectedBlogData}
                  onChange={(post) => updateDraft((content) => {
                    const index = content.blogPosts.findIndex((item) => item.id === post.id);
                    if (index >= 0) content.blogPosts[index] = post;
                  })}
                />
                <SectionActions onSave={saveCurrentBlog} onPublish={publishCurrentBlog} busy={busy} />
              </div>
            ) : (
              <EmptyEditor title="В блоге пока нет записей" />
            )}
          </section>
        ) : null}

        {section === "gallery" ? (
          <section className="admin-panel admin-two-column">
            <EntityList
              items={draft.galleryImages}
              activeId={selectedGallery}
              onSelect={setSelectedGallery}
              onCreate={addGallery}
              onDelete={removeGallery}
              onMove={(id, direction) => moveItem("galleryImages", id, direction)}
              addLabel="Добавить фото"
            />
            {selectedGalleryData ? (
              <div>
                <GalleryEditor
                  image={selectedGalleryData}
                  onChange={(image) => updateDraft((content) => {
                    const index = content.galleryImages.findIndex((item) => item.id === image.id);
                    if (index >= 0) content.galleryImages[index] = image;
                  })}
                />
                <SectionActions onSave={saveCurrentGallery} onPublish={publishCurrentGallery} busy={busy} />
              </div>
            ) : (
              <EmptyEditor title="В галерее пока нет фотографий" />
            )}
          </section>
        ) : null}

        {section === "documents" ? (
          <section className="admin-panel admin-two-column">
            <EntityList
              items={draft.documents}
              activeId={selectedDocument}
              onSelect={setSelectedDocument}
              onCreate={addDocument}
              onDelete={removeDocument}
              onMove={(id, direction) => moveItem("documents", id, direction)}
              addLabel="Добавить документ"
            />
            {selectedDocumentData ? (
              <div>
                <DocumentEditor
                  document={selectedDocumentData}
                  onChange={(document) => updateDraft((content) => {
                    const index = content.documents.findIndex((item) => item.id === document.id);
                    if (index >= 0) content.documents[index] = document;
                  })}
                />
                <SectionActions onSave={saveCurrentDocument} onPublish={publishCurrentDocument} busy={busy} />
              </div>
            ) : (
              <EmptyEditor title="Документов пока нет" />
            )}
          </section>
        ) : null}

        {section === "contacts" ? (
          <section className="admin-panel">
            <ContactsEditor
              contacts={draft.contacts}
              onChange={(contacts) => updateDraft((content) => {
                content.contacts = contacts;
              })}
            />
            <SectionActions onSave={saveContacts} onPublish={publishContactsContent} busy={busy} />
          </section>
        ) : null}

        {section === "media" ? (
          <section className="admin-panel">
            <MediaLibrary
              assets={mediaQuery.data ?? []}
              isLoading={mediaQuery.isLoading}
              uploadError={uploadMedia.isError ? uploadMedia.error.message : null}
              onUpload={(file) => runAction("Файл загружен", () => uploadMedia.mutateAsync(file))}
            />
          </section>
        ) : null}
      </main>
    </div>
  );
}

function PageEditor({ page, onChange }: { page: CmsPage; onChange: (page: CmsPage) => void }) {
  return (
    <div className="admin-form-grid">
      <Field label="Заголовок" value={page.title} onChange={(title) => onChange({ ...page, title })} />
      <Field label="Lead" value={page.lead} onChange={(lead) => onChange({ ...page, lead })} />
      <Field
        label="URL изображения"
        value={page.imageUrl ?? ""}
        hint={IMAGE_HINTS.hero}
        onChange={(imageUrl) => onChange({ ...page, imageUrl })}
      />
      <Field label="SEO title" value={page.seo.title} onChange={(title) => onChange({ ...page, seo: { ...page.seo, title } })} />
      <TextArea
        label="SEO description"
        value={page.seo.description}
        rows={3}
        onChange={(description) => onChange({ ...page, seo: { ...page.seo, description } })}
      />
      <TextArea label="Основной текст" value={paragraphsToText(page.body)} rows={9} onChange={(body) => onChange({ ...page, body: textToParagraphs(body) })} />
      <TextArea label="Тезисы" value={linesToText(page.bullets ?? [])} rows={6} onChange={(bullets) => onChange({ ...page, bullets: textToLines(bullets) })} />
    </div>
  );
}

function HomeEditor({
  features,
  cards,
  onFeaturesChange,
  onCardsChange,
}: {
  features: string[];
  cards: HomeCard[];
  onFeaturesChange: (features: string[]) => void;
  onCardsChange: (cards: HomeCard[]) => void;
}) {
  const patchCard = (index: number, patch: Partial<HomeCard>) => {
    onCardsChange(cards.map((card, cardIndex) => (cardIndex === index ? { ...card, ...patch } : card)));
  };

  return (
    <div className="admin-form-grid">
      <TextArea label="Преимущества" value={linesToText(features)} rows={6} onChange={(value) => onFeaturesChange(textToLines(value))} />
      <div className="admin-card-editor-list">
        {cards.map((card, index) => (
          <article key={card.slug} className="admin-edit-card">
            <h3>{card.slug}</h3>
            <Field label="Заголовок" value={card.title} onChange={(title) => patchCard(index, { title })} />
            <TextArea label="Описание" value={card.description} rows={4} onChange={(description) => patchCard(index, { description })} />
            <Field
              label="URL изображения"
              value={card.imageUrl}
              hint={IMAGE_HINTS.card}
              onChange={(imageUrl) => patchCard(index, { imageUrl })}
            />
          </article>
        ))}
      </div>
    </div>
  );
}

function CatalogSettingsEditor({
  settings,
  publishedSettings,
  categories,
  catalogError,
  onChange,
}: {
  settings: CatalogSettings;
  publishedSettings?: CatalogSettings;
  categories: CatalogCategory[];
  catalogError?: string;
  onChange: (settings: CatalogSettings) => void;
}) {
  const toggle = (field: keyof CatalogSettings, id: string) => {
    const current = new Set(settings[field]);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    onChange({ ...settings, [field]: [...current] });
  };

  const isPublishedHidden = (field: keyof CatalogSettings, id: string) => {
    return Boolean(publishedSettings?.[field]?.includes(id));
  };

  if (!categories.length) {
    return (
      <div className="admin-empty">
        <h3>Категории не загрузились</h3>
        <p>Проверь `CATALOG_API_BASE`, `CATALOG_API_METHOD_PREFIX` и ключи внешнего API в `server/.env`.</p>
      </div>
    );
  }

  return (
    <div className="admin-catalog-settings">
      <div className="admin-guidance">
        <h3>Blacklist каталога</h3>
        <p>
          Отмеченные категории будут скрыты на публичном сайте после публикации. Карточки без публичных документов
          скрываются автоматически.
        </p>
        {catalogError ? <p className="admin-error">Категории не загрузились: {catalogError}</p> : null}
      </div>
      <div className="admin-catalog-tree">
        {categories.map((category) => {
          const parentHidden = settings.hiddenLevel1.includes(category.id);

          return (
            <article key={category.id} className="admin-catalog-group">
              <label className="admin-check-row">
                <input
                  type="checkbox"
                  checked={parentHidden}
                  onChange={() => toggle("hiddenLevel1", category.id)}
                />
                <span>
                  <strong>{category.label}</strong>
                  {isPublishedHidden("hiddenLevel1", category.id) ? <em>Опубликовано скрыто</em> : null}
                </span>
              </label>
              <div className="admin-catalog-children">
                {(category.children ?? []).map((child) => (
                  <label key={child.id} className="admin-check-row admin-check-row--child">
                    <input
                      type="checkbox"
                      checked={settings.hiddenLevel2.includes(child.id)}
                      onChange={() => toggle("hiddenLevel2", child.id)}
                    />
                    <span>
                      <strong>{child.label}</strong>
                      {parentHidden ? <em>Скрыто родительской категорией</em> : null}
                      {isPublishedHidden("hiddenLevel2", child.id) ? <em>Опубликовано скрыто</em> : null}
                    </span>
                  </label>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function BlogEditor({ post, onChange }: { post: BlogPost; onChange: (post: BlogPost) => void }) {
  return (
    <div className="admin-form-grid">
      <Field label="Заголовок" value={post.title} onChange={(title) => onChange({ ...post, title, slug: post.slug || slugify(title) })} />
      <Field label="Slug" value={post.slug} onChange={(slug) => onChange({ ...post, slug })} />
      <Field label="Дата публикации" value={post.publishedAt} onChange={(publishedAt) => onChange({ ...post, publishedAt })} />
      <Field
        label="URL изображения"
        value={post.imageUrl}
        hint={IMAGE_HINTS.hero}
        onChange={(imageUrl) => onChange({ ...post, imageUrl })}
      />
      <TextArea label="Краткое описание" value={post.excerpt} rows={4} onChange={(excerpt) => onChange({ ...post, excerpt })} />
      <TextArea label="Теги, каждый с новой строки" value={linesToText(post.tags)} rows={4} onChange={(tags) => onChange({ ...post, tags: textToLines(tags) })} />
      <TextArea label="Текст записи" value={paragraphsToText(post.body)} rows={10} onChange={(body) => onChange({ ...post, body: textToParagraphs(body) })} />
    </div>
  );
}

function GalleryEditor({ image, onChange }: { image: GalleryImage; onChange: (image: GalleryImage) => void }) {
  return (
    <div className="admin-form-grid">
      <div className="admin-preview">
        {image.imageUrl ? <img src={image.imageUrl} alt={image.title} /> : <span>Превью появится после URL</span>}
      </div>
      <Field label="Название" value={image.title} onChange={(title) => onChange({ ...image, title })} />
      <Field
        label="URL миниатюры"
        value={image.imageUrl}
        hint={IMAGE_HINTS.galleryThumb}
        onChange={(imageUrl) => onChange({ ...image, imageUrl })}
      />
      <Field
        label="URL большого изображения"
        value={image.fullImageUrl ?? ""}
        hint={IMAGE_HINTS.galleryFull}
        onChange={(fullImageUrl) => onChange({ ...image, fullImageUrl })}
      />
    </div>
  );
}

function DocumentEditor({ document, onChange }: { document: DocumentItem; onChange: (document: DocumentItem) => void }) {
  return (
    <div className="admin-form-grid">
      <div className="admin-preview">
        {document.previewUrl ? <img src={document.previewUrl} alt={document.title} /> : <span>Можно указать картинку предпросмотра</span>}
      </div>
      <Field label="Название" value={document.title} onChange={(title) => onChange({ ...document, title })} />
      <Field label="Категория" value={document.category} onChange={(category) => onChange({ ...document, category })} />
      <Field label="URL файла" value={document.fileUrl} onChange={(fileUrl) => onChange({ ...document, fileUrl })} />
      <Field
        label="URL превью"
        value={document.previewUrl ?? ""}
        hint={IMAGE_HINTS.documentPreview}
        onChange={(previewUrl) => onChange({ ...document, previewUrl })}
      />
      <TextArea label="Описание" value={document.description} rows={5} onChange={(description) => onChange({ ...document, description })} />
    </div>
  );
}

function ContactsEditor({ contacts, onChange }: { contacts: ContactInfo; onChange: (contacts: ContactInfo) => void }) {
  const patchPhone = (index: number, patch: Partial<ContactInfo["phones"][number]>) => {
    onChange({
      ...contacts,
      phones: contacts.phones.map((phone, phoneIndex) => (phoneIndex === index ? { ...phone, ...patch } : phone)),
    });
  };

  return (
    <div className="admin-form-grid">
      <div className="admin-card-editor-list">
        {contacts.phones.map((phone, index) => (
          <article key={`${phone.label}-${index}`} className="admin-edit-card admin-edit-card--inline">
            <Field label="Подпись" value={phone.label} onChange={(label) => patchPhone(index, { label })} />
            <Field label="Телефон" value={phone.value} onChange={(value) => patchPhone(index, { value })} />
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={() => onChange({ ...contacts, phones: contacts.phones.filter((_, phoneIndex) => phoneIndex !== index) })}
            >
              Удалить
            </button>
          </article>
        ))}
      </div>
      <button
        type="button"
        className="admin-button admin-button--secondary"
        onClick={() => onChange({ ...contacts, phones: [...contacts.phones, { label: "Телефон", value: "" }] })}
      >
        Добавить телефон
      </button>
      <Field label="Email" value={contacts.email} onChange={(email) => onChange({ ...contacts, email })} />
      <TextArea label="Адрес" value={contacts.address} rows={3} onChange={(address) => onChange({ ...contacts, address })} />
      <Field label="Yandex map embed URL" value={contacts.mapEmbedUrl ?? ""} onChange={(mapEmbedUrl) => onChange({ ...contacts, mapEmbedUrl })} />
      <Field label="Ссылка на карту" value={contacts.mapExternalUrl ?? ""} onChange={(mapExternalUrl) => onChange({ ...contacts, mapExternalUrl })} />
      <Field label="Ссылка на маршрут" value={contacts.routeUrl ?? ""} onChange={(routeUrl) => onChange({ ...contacts, routeUrl })} />
    </div>
  );
}

function MediaLibrary({
  assets,
  isLoading,
  uploadError,
  onUpload,
}: {
  assets: MediaAsset[];
  isLoading: boolean;
  uploadError: string | null;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="admin-media">
      <label className="admin-upload">
        <input
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = "";
          }}
        />
        <span>Выбрать файл</span>
        <small>Изображения, PDF и документы сохраняются в `server/uploads`.</small>
      </label>
      {uploadError ? <p className="admin-error">{uploadError}</p> : null}
      {isLoading ? <ContentState>Загружаем медиатеку...</ContentState> : null}
      {!appConfig.cmsApiBase ? <p className="admin-note">Медиатека доступна только при подключенном backend.</p> : null}
      <div className="admin-media-grid">
        {assets.map((asset) => (
          <article key={asset.id} className="admin-media-card">
            {asset.mimeType.startsWith("image/") ? <img src={asset.url} alt={asset.originalName} /> : <div className="admin-file-badge">FILE</div>}
            <strong>{asset.originalName}</strong>
            <span>{fileSize(asset.size)}</span>
            <input value={asset.url} readOnly onFocus={(event) => event.currentTarget.select()} />
          </article>
        ))}
      </div>
    </div>
  );
}

function EmptyEditor({ title }: { title: string }) {
  return (
    <div className="admin-empty">
      <h3>{title}</h3>
      <p>Создай первую запись через кнопку слева, затем заполни поля и опубликуй.</p>
    </div>
  );
}
