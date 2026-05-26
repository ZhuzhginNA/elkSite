export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
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

export interface CmsContent {
  pages: Record<string, CmsPage>;
  homeFeatures: string[];
  homeCards: HomeCard[];
  galleryImages: GalleryImage[];
  documents: DocumentItem[];
  blogPosts: BlogPost[];
  contacts: ContactInfo;
}
