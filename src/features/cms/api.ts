import { appConfig } from "../../shared/config";
import { httpGet } from "../../shared/http";
import { createDefaultCmsContent } from "../../shared/mockData";
import type {
  BlogPost,
  CmsContent,
  CmsPage,
  ContactInfo,
  DocumentItem,
  GalleryImage,
} from "../../shared/types";

const CMS_STORAGE_KEY = "elk-site-cms-content";

function cloneContent(content: CmsContent): CmsContent {
  return JSON.parse(JSON.stringify(content)) as CmsContent;
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

  return httpGet<CmsContent>(`${appConfig.cmsApiBase}/content`);
}

export async function fetchCmsPage(slug: string): Promise<CmsPage | null> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).pages[slug] ?? null;
  }

  const payload = await httpGet<unknown>(`${appConfig.cmsApiBase}/pages/${slug}`);
  return normalizePageResponse(payload, slug);
}

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).galleryImages;
  }

  return httpGet<GalleryImage[]>(`${appConfig.cmsApiBase}/gallery`);
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).documents;
  }

  return httpGet<DocumentItem[]>(`${appConfig.cmsApiBase}/documents`);
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).blogPosts;
  }

  return httpGet<BlogPost[]>(`${appConfig.cmsApiBase}/blog`);
}

export async function fetchContacts(): Promise<ContactInfo> {
  if (!appConfig.cmsApiBase) {
    return cloneContent(readLocalContent()).contacts;
  }

  return httpGet<ContactInfo>(`${appConfig.cmsApiBase}/contacts`);
}
