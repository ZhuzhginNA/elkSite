import { useEffect, useMemo, useState } from "react";
import { useGalleryImages } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

const GALLERY_PAGE_SIZE = 12;
const LIGHTBOX_DOT_WINDOW = 7;

export function GalleryPage() {
  const { data, isLoading, isError, error } = useGalleryImages();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const images = data ?? [];
  const totalPages = Math.max(1, Math.ceil(images.length / GALLERY_PAGE_SIZE));
  const visibleImages = useMemo(() => {
    const start = (currentPage - 1) * GALLERY_PAGE_SIZE;
    return images.slice(start, start + GALLERY_PAGE_SIZE);
  }, [currentPage, images]);

  const activeImage = activeIndex !== null ? images[activeIndex] ?? null : null;
  const activePage = activeIndex !== null ? Math.floor(activeIndex / GALLERY_PAGE_SIZE) + 1 : currentPage;

  const visibleDots = useMemo(() => {
    if (!images.length || activeIndex === null) {
      return [];
    }

    const halfWindow = Math.floor(LIGHTBOX_DOT_WINDOW / 2);
    const start = Math.max(0, Math.min(activeIndex - halfWindow, images.length - LIGHTBOX_DOT_WINDOW));
    const end = Math.min(images.length, start + LIGHTBOX_DOT_WINDOW);

    return images.slice(start, end).map((item, offset) => ({
      item,
      index: start + offset,
    }));
  }, [activeIndex, images]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null) return current;
          return current === 0 ? images.length - 1 : current - 1;
        });
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null) return current;
          return current === images.length - 1 ? 0 : current + 1;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length]);

  const goToPrevious = () => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === 0 ? images.length - 1 : current - 1;
    });
  };

  const goToNext = () => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === images.length - 1 ? 0 : current + 1;
    });
  };

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head section-head--center">
          <h1 className="section-title">Галерея ООО «ЭЛК»</h1>
          <p className="section-lead section-lead--center">
            Фотографии производственных процессов, рабочих зон и ключевых этапов выполнения заказов.
          </p>
        </div>

        {isLoading ? <ContentState>Загружаем галерею...</ContentState> : null}
        {isError ? <ContentState error>Не удалось загрузить галерею: {error.message}</ContentState> : null}

        {!isLoading && !isError ? (
          <>
            <div className="gallery-grid">
              {visibleImages.map((item, index) => {
                const realIndex = (currentPage - 1) * GALLERY_PAGE_SIZE + index;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="gallery-card"
                    onClick={() => setActiveIndex(realIndex)}
                    aria-label={`Открыть изображение: ${item.title}`}
                  >
                    <img src={item.imageUrl} alt={item.title} loading="lazy" decoding="async" />
                  </button>
                );
              })}
            </div>

            {totalPages > 1 ? (
              <nav className="gallery-pagination" aria-label="Страницы галереи">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;

                  return (
                    <button
                      key={page}
                      type="button"
                      className={`gallery-pagination__button${isActive ? " gallery-pagination__button--active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {page}
                    </button>
                  );
                })}
              </nav>
            ) : null}
          </>
        ) : null}
      </section>

      {activeImage ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фотографии" onClick={() => setActiveIndex(null)}>
          <div className="lightbox__backdrop" />
          <div className="lightbox__content" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="lightbox__close" onClick={() => setActiveIndex(null)} aria-label="Закрыть просмотр">
              ×
            </button>

            <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={goToPrevious} aria-label="Предыдущее фото">
              ‹
            </button>

            <figure className="lightbox__figure">
              <img src={activeImage.fullImageUrl ?? activeImage.imageUrl} alt={activeImage.title} className="lightbox__image" />
              <figcaption className="lightbox__caption">
                <span>{activeImage.title}</span>
                <strong>
                  {activeIndex + 1} / {images.length}
                </strong>
              </figcaption>
            </figure>

            <button type="button" className="lightbox__nav lightbox__nav--next" onClick={goToNext} aria-label="Следующее фото">
              ›
            </button>

            <div className="lightbox__dots" aria-label={`Позиция в галерее, страница ${activePage}`}>
              {visibleDots.map(({ item, index }) => (
                <button
                  key={item.id}
                  type="button"
                  className={`lightbox__dot${index === activeIndex ? " lightbox__dot--active" : ""}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Перейти к фото ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
