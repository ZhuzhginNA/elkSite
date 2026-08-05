import { appConfig } from "../../shared/config";
import { httpDelete, httpGet, httpPost, httpPut } from "../../shared/http";
import { createDefaultCmsContent } from "../../shared/mockData";
import type {
  BlogPost,
  CmsContent,
  CmsPage,
  ContactInfo,
  DocumentItem,
  GalleryImage,
  MediaAsset,
} from "../../shared/types";

const CMS_STORAGE_KEY = "elk-site-cms-content";
const LOCAL_ADMIN_KEY = "elk-site-local-admin";

function cloneContent(content: CmsContent): CmsContent {
  return JSON.parse(JSON.stringify(content)) as CmsContent;
}

function resolveCmsAssetUrl(url?: string | null) {
  if (!url) return url ?? "";
  if (!appConfig.cmsApiBase) return url;
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url)) return url;

  const cmsOrigin = appConfig.cmsApiBase.replace(/\/api\/?$/, "");
  if (url.startsWith("/uploads/")) {
    return `${cmsOrigin}${url}`;
  }

  if (url.startsWith("uploads/")) {
    return `${cmsOrigin}/${url}`;
  }

  return url;
}

function normalizeCmsContentAssets(content: CmsContent): CmsContent {
  return {
    ...content,
    pages: Object.fromEntries(
      Object.entries(content.pages).map(([slug, page]) => [
        slug,
        {
          ...page,
          imageUrl: resolveCmsAssetUrl(page.imageUrl),
        },
      ]),
    ),
    homeCards: content.homeCards.map((card) => ({
      ...card,
      imageUrl: resolveCmsAssetUrl(card.imageUrl),
    })),
    galleryImages: content.galleryImages.map((image) => ({
      ...image,
      imageUrl: resolveCmsAssetUrl(image.imageUrl),
      fullImageUrl: resolveCmsAssetUrl(image.fullImageUrl),
    })),
    documents: content.documents.map((document) => ({
      ...document,
      fileUrl: resolveCmsAssetUrl(document.fileUrl),
      previewUrl: resolveCmsAssetUrl(document.previewUrl),
    })),
    blogPosts: content.blogPosts.map((post) => ({
      ...post,
      imageUrl: resolveCmsAssetUrl(post.imageUrl),
    })),
    contacts: {
      ...content.contacts,
      mapImageUrl: resolveCmsAssetUrl(content.contacts.mapImageUrl),
      mapFullImageUrl: resolveCmsAssetUrl(content.contacts.mapFullImageUrl),
      officeImageUrl: resolveCmsAssetUrl(content.contacts.officeImageUrl),
      officeFullImageUrl: resolveCmsAssetUrl(content.contacts.officeFullImageUrl),
    },
  };
}

function readLocalContent(): CmsContent {
  const fallback = createDefaultCmsContent();

  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(CMS_STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as CmsContent;

    // Keep older local snapshots usable while backfilling new legacy gallery images.
    if (!Array.isArray(parsed.galleryImages) || parsed.galleryImages.length < fallback.galleryImages.length) {
      return {
        ...parsed,
        galleryImages: fallback.galleryImages,
      };
    }

    return parsed;
  } catch {
    return fallback;
  }
}

export function saveLocalContent(content: CmsContent) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(content));
}

export function resetLocalContent() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CMS_STORAGE_KEY);
}

function normalizePageResponse(payload: unknown, slug: string): CmsPage | null {
  if (typeof payload === "object" && payload !== null && "slug" in payload) {
    return payload as CmsPage;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    typeof (payload as { data?: unknown }).data === "object" &&
    (payload as { data?: { slug?: string } }).data?.slug
  ) {
    return (payload as { data: CmsPage }).data;
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (
      ((payload as { data: CmsPage[] }).data.find((item) => item.slug === slug) as CmsPage | undefined) ??
      null
    );
  }

  return null;
}

export async function fetchCmsContent(): Promise<CmsContent> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent());
  }

  return normalizeCmsContentAssets(await httpGet<CmsContent>(`${appConfig.cmsApiBase}/content`));
}

export async function fetchAdminContent(): Promise<CmsContent> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent());
  }

  return normalizeCmsContentAssets(await httpGet<CmsContent>(`${appConfig.cmsApiBase}/admin/content`));
}

export async function fetchCmsPage(slug: string): Promise<CmsPage | null> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).pages[slug] ?? null;
  }

  return (await fetchCmsContent()).pages[slug] ?? null;
}

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).galleryImages;
  }

  return (await fetchCmsContent()).galleryImages;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).documents;
  }

  return (await fetchCmsContent()).documents;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).blogPosts;
  }

  return (await fetchCmsContent()).blogPosts;
}

export async function fetchContacts(): Promise<ContactInfo> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).contacts;
  }

  return (await fetchCmsContent()).contacts;
}

export async function loginAdmin(credentials: { login: string; password: string }) {
  if (!appConfig.cmsApiBase) {
    window.localStorage.setItem(LOCAL_ADMIN_KEY, credentials.login || "admin");
    return { login: credentials.login || "admin", role: "LOCAL_ADMIN" };
  }

  return httpPost<{ id: string; login: string; role: string }>(`${appConfig.cmsApiBase}/auth/login`, credentials);
}

export async function fetchAdminMe() {
  if (!appConfig.cmsApiBase) {
    const login = window.localStorage.getItem(LOCAL_ADMIN_KEY);
    return login ? { login, role: "LOCAL_ADMIN" } : null;
  }

  const response = await fetch(`${appConfig.cmsApiBase}/auth/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 401) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : (payload as { message?: string })?.message || "Request failed";

    throw new Error(message);
  }

  return payload as { sub: string; login: string; role: string };
}

export async function logoutAdmin() {
  if (!appConfig.cmsApiBase) {
    window.localStorage.removeItem(LOCAL_ADMIN_KEY);
    return { ok: true };
  }

  return httpPost<{ ok: boolean }>(`${appConfig.cmsApiBase}/auth/logout`);
}

export async function savePageDraft(slug: string, page: CmsPage, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return page;
  }

  return httpPut(`${appConfig.cmsApiBase}/admin/pages/${slug}/draft`, page);
}

export async function publishPage(slug: string) {
  if (!appConfig.cmsApiBase) return { ok: true };
  return httpPost(`${appConfig.cmsApiBase}/admin/pages/${slug}/publish`);
}

export async function saveHomeDraft(payload: Pick<CmsContent, "homeFeatures" | "homeCards">, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return payload;
  }

  return httpPut(`${appConfig.cmsApiBase}/admin/home/draft`, payload);
}

export async function publishHome() {
  if (!appConfig.cmsApiBase) return { ok: true };
  return httpPost(`${appConfig.cmsApiBase}/admin/home/publish`);
}

export async function saveBlogDraft(id: string, post: BlogPost, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return post;
  }

  return httpPut(`${appConfig.cmsApiBase}/admin/blog/${id}/draft`, post);
}

export async function publishBlog(id: string) {
  if (!appConfig.cmsApiBase) return { ok: true };
  return httpPost(`${appConfig.cmsApiBase}/admin/blog/${id}/publish`);
}

export async function createBlog(post: BlogPost, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return post;
  }

  return httpPost(`${appConfig.cmsApiBase}/admin/blog`, post);
}

export async function deleteBlog(id: string, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return { ok: true };
  }

  return httpDelete(`${appConfig.cmsApiBase}/admin/blog/${id}`);
}

export async function saveGalleryImage(id: string, image: GalleryImage, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return image;
  }

  return httpPut(`${appConfig.cmsApiBase}/admin/gallery/${id}`, image);
}

export async function publishGalleryImage(id: string) {
  if (!appConfig.cmsApiBase) return { ok: true };
  return httpPost(`${appConfig.cmsApiBase}/admin/gallery/${id}/publish`);
}

export async function createGalleryImage(image: GalleryImage, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return image;
  }

  return httpPost(`${appConfig.cmsApiBase}/admin/gallery`, image);
}

export async function deleteGalleryImage(id: string, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return { ok: true };
  }

  return httpDelete(`${appConfig.cmsApiBase}/admin/gallery/${id}`);
}

export async function reorderGalleryImages(ids: string[], fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return { ok: true };
  }

  return httpPut(`${appConfig.cmsApiBase}/admin/gallery/order`, { ids });
}

export async function saveDocumentItem(id: string, document: DocumentItem, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return document;
  }

  return httpPut(`${appConfig.cmsApiBase}/admin/documents/${id}`, document);
}

export async function publishDocumentItem(id: string) {
  if (!appConfig.cmsApiBase) return { ok: true };
  return httpPost(`${appConfig.cmsApiBase}/admin/documents/${id}/publish`);
}

export async function createDocumentItem(document: DocumentItem, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return document;
  }

  return httpPost(`${appConfig.cmsApiBase}/admin/documents`, document);
}

export async function deleteDocumentItem(id: string, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return { ok: true };
  }

  return httpDelete(`${appConfig.cmsApiBase}/admin/documents/${id}`);
}

export async function reorderDocumentItems(ids: string[], fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return { ok: true };
  }

  return httpPut(`${appConfig.cmsApiBase}/admin/documents/order`, { ids });
}

export async function saveContactsDraft(contacts: ContactInfo, fallbackContent?: CmsContent) {
  if (!appConfig.cmsApiBase) {
    if (fallbackContent) saveLocalContent(fallbackContent);
    return contacts;
  }

  return httpPut(`${appConfig.cmsApiBase}/admin/contacts/draft`, contacts);
}

export async function publishContacts() {
  if (!appConfig.cmsApiBase) return { ok: true };
  return httpPost(`${appConfig.cmsApiBase}/admin/contacts/publish`);
}

export async function fetchMediaAssets(): Promise<MediaAsset[]> {
  if (!appConfig.cmsApiBase) return [];
  const assets = await httpGet<MediaAsset[]>(`${appConfig.cmsApiBase}/admin/media`);
  return assets.map((asset) => ({
    ...asset,
    url: resolveCmsAssetUrl(asset.url),
  }));
}

export async function uploadMediaAsset(file: File): Promise<MediaAsset> {
  if (!appConfig.cmsApiBase) {
    throw new Error("Загрузка файлов доступна только при подключенном backend");
  }

  const formData = new FormData();
  formData.append("file", file);
  return httpPost<MediaAsset>(`${appConfig.cmsApiBase}/admin/media`, formData);
}
