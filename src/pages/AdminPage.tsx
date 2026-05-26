import { useEffect, useMemo, useState } from "react";
import { useCmsContent, useResetCmsContent, useSaveCmsContent } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";
import type { BlogPost, CmsContent, ContactPhone, DocumentItem, GalleryImage } from "../shared/types";

function cloneContent(content: CmsContent): CmsContent {
  return JSON.parse(JSON.stringify(content)) as CmsContent;
}

function listToText(items: string[], compact = false) {
  return items.join(compact ? "\n" : "\n\n");
}

function textToList(text: string) {
  return text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function updatePageField(
  content: CmsContent,
  slug: string,
  field: "title" | "lead" | "imageUrl",
  value: string,
) {
  content.pages[slug] = { ...content.pages[slug], [field]: value };
}

function updatePageListField(
  content: CmsContent,
  slug: string,
  field: "body" | "bullets",
  value: string,
) {
  content.pages[slug] = {
    ...content.pages[slug],
    [field]: field === "body" ? value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean) : textToList(value),
  };
}

function updateDocument(content: CmsContent, index: number, patch: Partial<DocumentItem>) {
  content.documents[index] = { ...content.documents[index], ...patch };
}

function updateGallery(content: CmsContent, index: number, patch: Partial<GalleryImage>) {
  content.galleryImages[index] = { ...content.galleryImages[index], ...patch };
}

function updateBlogPost(content: CmsContent, index: number, patch: Partial<BlogPost>) {
  content.blogPosts[index] = { ...content.blogPosts[index], ...patch };
}

function updatePhone(content: CmsContent, index: number, patch: Partial<ContactPhone>) {
  content.contacts.phones[index] = { ...content.contacts.phones[index], ...patch };
}

export function AdminPage() {
  const { data, isLoading, isError, error } = useCmsContent();
  const saveMutation = useSaveCmsContent();
  const resetMutation = useResetCmsContent();
  const [draft, setDraft] = useState<CmsContent | null>(null);

  useEffect(() => {
    if (data) {
      setDraft(cloneContent(data));
    }
  }, [data]);

  const pages = useMemo(
    () => [
      { slug: "home", label: "Главная" },
      { slug: "about", label: "О компании" },
      { slug: "installation", label: "Монтаж" },
      { slug: "techcontrol", label: "Техконтроль" },
      { slug: "service", label: "Сервис" },
    ],
    [],
  );

  if (isLoading || !draft) {
    return <ContentState>Загружаем админку...</ContentState>;
  }

  if (isError) {
    return <ContentState error>Не удалось загрузить админку: {error.message}</ContentState>;
  }

  return (
    <div className="admin-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">Локальная админка</h1>
          <p className="section-lead">
            Временная клиентская админка без backend. Данные сохраняются в `localStorage` текущего браузера и потом могут быть перенесены в реальную CMS.
          </p>
        </div>

        <div className="admin-actions">
          <button
            type="button"
            className="action-button"
            onClick={() => saveMutation.mutate(draft)}
            disabled={saveMutation.isPending}
          >
            Сохранить изменения
          </button>
          <button
            type="button"
            className="action-button action-button--ghost"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
          >
            Сбросить к исходному контенту
          </button>
        </div>

        {saveMutation.isSuccess ? <div className="state">Контент сохранен локально.</div> : null}

        <div className="admin-grid">
          <article className="admin-card">
            <h2>Преимущества на главной</h2>
            <label className="admin-field">
              <span>Список преимуществ</span>
              <textarea
                rows={6}
                value={listToText(draft.homeFeatures, true)}
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, homeFeatures: textToList(event.target.value) } : current,
                  )
                }
              />
            </label>
          </article>

          <article className="admin-card">
            <h2>Карточки главной</h2>
            <div className="admin-stack">
              {draft.homeCards.map((card, index) => (
                <div key={card.slug} className="admin-subcard">
                  <strong>{card.slug}</strong>
                  <label className="admin-field">
                    <span>Заголовок</span>
                    <input
                      value={card.title}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          next.homeCards[index] = { ...next.homeCards[index], title: event.target.value };
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Описание</span>
                    <textarea
                      rows={4}
                      value={card.description}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          next.homeCards[index] = { ...next.homeCards[index], description: event.target.value };
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Изображение</span>
                    <input
                      value={card.imageUrl}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          next.homeCards[index] = { ...next.homeCards[index], imageUrl: event.target.value };
                          return next;
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </article>

          {pages.map(({ slug, label }) => {
            const page = draft.pages[slug];

            return (
              <article key={slug} className="admin-card">
                <h2>{label}</h2>
                <label className="admin-field">
                  <span>Заголовок</span>
                  <input
                    value={page.title}
                    onChange={(event) =>
                      setDraft((current) => {
                        if (!current) return current;
                        const next = cloneContent(current);
                        updatePageField(next, slug, "title", event.target.value);
                        return next;
                      })
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Лид</span>
                  <textarea
                    rows={3}
                    value={page.lead}
                    onChange={(event) =>
                      setDraft((current) => {
                        if (!current) return current;
                        const next = cloneContent(current);
                        updatePageField(next, slug, "lead", event.target.value);
                        return next;
                      })
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Изображение</span>
                  <input
                    value={page.imageUrl ?? ""}
                    onChange={(event) =>
                      setDraft((current) => {
                        if (!current) return current;
                        const next = cloneContent(current);
                        updatePageField(next, slug, "imageUrl", event.target.value);
                        return next;
                      })
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Основной текст</span>
                  <textarea
                    rows={8}
                    value={listToText(page.body)}
                    onChange={(event) =>
                      setDraft((current) => {
                        if (!current) return current;
                        const next = cloneContent(current);
                        updatePageListField(next, slug, "body", event.target.value);
                        return next;
                      })
                    }
                  />
                </label>
                <label className="admin-field">
                  <span>Список тезисов</span>
                  <textarea
                    rows={6}
                    value={listToText(page.bullets ?? [], true)}
                    onChange={(event) =>
                      setDraft((current) => {
                        if (!current) return current;
                        const next = cloneContent(current);
                        updatePageListField(next, slug, "bullets", event.target.value);
                        return next;
                      })
                    }
                  />
                </label>
              </article>
            );
          })}

          <article className="admin-card">
            <h2>Документы</h2>
            <div className="admin-stack">
              {draft.documents.map((item, index) => (
                <div key={item.id} className="admin-subcard">
                  <label className="admin-field">
                    <span>Название</span>
                    <input
                      value={item.title}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateDocument(next, index, { title: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Описание</span>
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateDocument(next, index, { description: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Категория</span>
                    <input
                      value={item.category}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateDocument(next, index, { category: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <h2>Блог</h2>
            <div className="admin-stack">
              {draft.blogPosts.map((post, index) => (
                <div key={post.id} className="admin-subcard">
                  <label className="admin-field">
                    <span>Заголовок</span>
                    <input
                      value={post.title}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateBlogPost(next, index, { title: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Дата</span>
                    <input
                      value={post.publishedAt}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateBlogPost(next, index, { publishedAt: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Краткое описание</span>
                    <textarea
                      rows={3}
                      value={post.excerpt}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateBlogPost(next, index, { excerpt: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Теги</span>
                    <textarea
                      rows={3}
                      value={listToText(post.tags, true)}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateBlogPost(next, index, { tags: textToList(event.target.value) });
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Текст статьи</span>
                    <textarea
                      rows={8}
                      value={listToText(post.body)}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateBlogPost(next, index, {
                            body: event.target.value
                              .split(/\n\s*\n/)
                              .map((item) => item.trim())
                              .filter(Boolean),
                          });
                          return next;
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <h2>Галерея</h2>
            <div className="admin-stack">
              {draft.galleryImages.slice(0, 8).map((item, index) => (
                <div key={item.id} className="admin-subcard">
                  <label className="admin-field">
                    <span>Подпись</span>
                    <input
                      value={item.title}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateGallery(next, index, { title: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Превью</span>
                    <input
                      value={item.imageUrl}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updateGallery(next, index, { imageUrl: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <h2>Контакты и footer</h2>
            <div className="admin-stack">
              {draft.contacts.phones.map((phone, index) => (
                <div key={`${phone.label}-${index}`} className="admin-subcard admin-subcard--row">
                  <label className="admin-field">
                    <span>Подпись</span>
                    <input
                      value={phone.label}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updatePhone(next, index, { label: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span>Значение</span>
                    <input
                      value={phone.value}
                      onChange={(event) =>
                        setDraft((current) => {
                          if (!current) return current;
                          const next = cloneContent(current);
                          updatePhone(next, index, { value: event.target.value });
                          return next;
                        })
                      }
                    />
                  </label>
                </div>
              ))}

              <label className="admin-field">
                <span>Email</span>
                <input
                  value={draft.contacts.email}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, contacts: { ...current.contacts, email: event.target.value } } : current,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>Адрес</span>
                <textarea
                  rows={4}
                  value={draft.contacts.address}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, contacts: { ...current.contacts, address: event.target.value } } : current,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>Ссылка для embed карты</span>
                <input
                  value={draft.contacts.mapEmbedUrl ?? ""}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, contacts: { ...current.contacts, mapEmbedUrl: event.target.value } }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>Ссылка на Яндекс Карты</span>
                <input
                  value={draft.contacts.mapExternalUrl ?? ""}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, contacts: { ...current.contacts, mapExternalUrl: event.target.value } }
                        : current,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>Ссылка на маршрут</span>
                <input
                  value={draft.contacts.routeUrl ?? ""}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, contacts: { ...current.contacts, routeUrl: event.target.value } } : current,
                    )
                  }
                />
              </label>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
