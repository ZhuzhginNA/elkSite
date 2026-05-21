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
}

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  category: string;
}

export interface BlogPostPreview {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  imageUrl: string;
}

export interface ContactInfo {
  phones: string[];
  email: string;
  address: string;
  mapImageUrl: string;
  officeImageUrl: string;
}
