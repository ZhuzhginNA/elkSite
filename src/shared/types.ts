export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
}

export interface CatalogSettings {
  hiddenLevel1: string[];
  hiddenLevel2: string[];
}

export interface CatalogCategory {
  id: string;
  value: string;
  label: string;
  level: 1 | 2;
  parentId?: string;
  children?: CatalogCategory[];
}

export interface CatalogDocument {
  id: string;
  title: string;
  downloadUrl: string;
}

export interface CatalogRelation {
  id: string;
  title: string;
  available: boolean;
  categoryId?: string;
  disabledReason?: string;
}

export interface CatalogCardSummary {
  id: string;
  title: string;
  code?: string;
  categoryId: string;
}

export interface CatalogCardImage {
  url: string;
  title: string;
  filename?: string;
}

export interface CatalogCardDetails {
  id: string;
  title: string;
  code?: string;
  comment?: string;
  documents: CatalogDocument[];
  zamParts: CatalogRelation[];
}

export interface SeoMeta {
  title: string;
  description: string;
}

export interface CmsPage {
  slug: string;
  title: string;
  lead: string;
  body: string[];
  seo: SeoMeta;
  imageUrl?: string;
  bullets?: string[];
}

export interface HomeCard {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  fullImageUrl?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  category: string;
  previewUrl?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  imageUrl: string;
  tags: string[];
  body: string[];
}

export interface ContactPhone {
  label: string;
  value: string;
}

export interface ContactInfo {
  phones: ContactPhone[];
  email: string;
  address: string;
  mapEmbedUrl?: string;
  mapExternalUrl?: string;
  routeUrl?: string;
  mapImageUrl?: string;
  mapFullImageUrl?: string;
  officeImageUrl?: string;
  officeFullImageUrl?: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface CmsContent {
  pages: Record<string, CmsPage>;
  homeFeatures: string[];
  homeCards: HomeCard[];
  galleryImages: GalleryImage[];
  documents: DocumentItem[];
  blogPosts: BlogPost[];
  contacts: ContactInfo;
}
