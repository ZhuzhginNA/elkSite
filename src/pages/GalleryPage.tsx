import { useGalleryImages } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

export function GalleryPage() {
  const { data, isLoading, isError, error } = useGalleryImages();

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head section-head--center">
          <h1 className="section-title">Галерея ООО «ЭЛК»</h1>
        </div>

        {isLoading ? <ContentState>Загружаем галерею...</ContentState> : null}
        {isError ? <ContentState error>Не удалось загрузить галерею: {error.message}</ContentState> : null}

        {!isLoading && !isError ? (
          <div className="gallery-grid">
            {data?.map((item) => (
              <figure key={item.id} className="gallery-card">
                <img src={item.imageUrl} alt={item.title} />
                <figcaption>{item.title}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
