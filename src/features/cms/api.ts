import { appConfig } from "../../shared/config";
import { httpGet } from "../../shared/http";
import {
  mockBlogPosts,
  mockCmsPages,
  mockContacts,
  mockDocuments,
  mockGalleryImages,
} from "../../shared/mockData";
import type {
  BlogPostPreview,
  CmsPage,
  ContactInfo,
  DocumentItem,
  GalleryImage,
} from "../../shared/types";

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

export async function fetchCmsPage(slug: string): Promise<CmsPage | null> {
  if (!appConfig.cmsApiBase) {
    return mockCmsPages[slug] ?? null;
  }

  const payload = await httpGet<unknown>(`${appConfig.cmsApiBase}/pages/${slug}`);
  return normalizePageResponse(payload, slug);
}

export async function fetchGalleryImages(): Promise<GalleryImage[]> {
  if (!appConfig.cmsApiBase) {
    return mockGalleryImages;
  }

  return httpGet<GalleryImage[]>(`${appConfig.cmsApiBase}/gallery`);
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  if (!appConfig.cmsApiBase) {
    return mockDocuments;
  }

  return httpGet<DocumentItem[]>(`${appConfig.cmsApiBase}/documents`);
}

export async function fetchBlogPosts(): Promise<BlogPostPreview[]> {
  if (!appConfig.cmsApiBase) {
    return mockBlogPosts;
  }

  return httpGet<BlogPostPreview[]>(`${appConfig.cmsApiBase}/blog`);
}

export async function fetchContacts(): Promise<ContactInfo> {
  if (!appConfig.cmsApiBase) {
    return mockContacts;
  }

  return httpGet<ContactInfo>(`${appConfig.cmsApiBase}/contacts`);
}
