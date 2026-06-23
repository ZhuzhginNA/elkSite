import { Injectable, NotFoundException } from "@nestjs/common";
import { ContentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type {
  BlogPost,
  CmsContent,
  CmsPage,
  ContactInfo,
  DocumentItem,
  GalleryImage,
  HomeCard,
} from "../../../src/shared/types";

interface HomeDraft {
  homeFeatures: string[];
  homeCards: HomeCard[];
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicContent(): Promise<CmsContent> {
    const [pages, home, blogPosts, galleryImages, documents, contacts] = await Promise.all([
      this.prisma.page.findMany(),
      this.prisma.homeContent.findUnique({ where: { id: "home" } }),
      this.prisma.blogPost.findMany({ where: { status: ContentStatus.PUBLISHED }, orderBy: { createdAt: "asc" } }),
      this.prisma.galleryImage.findMany({ where: { status: ContentStatus.PUBLISHED }, orderBy: { sortOrder: "asc" } }),
      this.prisma.documentItem.findMany({ where: { status: ContentStatus.PUBLISHED }, orderBy: { sortOrder: "asc" } }),
      this.prisma.contactInfo.findUnique({ where: { id: "contacts" } }),
    ]);

    const homeContent = (home?.publishedContent ?? { homeFeatures: [], homeCards: [] }) as unknown as HomeDraft;

    return {
      pages: Object.fromEntries(pages.map((page) => [page.slug, page.publishedContent as unknown as CmsPage])),
      homeFeatures: homeContent.homeFeatures,
      homeCards: homeContent.homeCards,
      blogPosts: blogPosts.map((item) => item.publishedContent as unknown as BlogPost),
      galleryImages: galleryImages.map((item) => item.publishedContent as unknown as GalleryImage),
      documents: documents.map((item) => item.publishedContent as unknown as DocumentItem),
      contacts: (contacts?.publishedContent ?? { phones: [], email: "", address: "" }) as unknown as ContactInfo,
    };
  }

  async getDraftContent(): Promise<CmsContent> {
    const [pages, home, blogPosts, galleryImages, documents, contacts] = await Promise.all([
      this.prisma.page.findMany(),
      this.prisma.homeContent.findUnique({ where: { id: "home" } }),
      this.prisma.blogPost.findMany({ orderBy: { createdAt: "asc" } }),
      this.prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } }),
      this.prisma.documentItem.findMany({ orderBy: { sortOrder: "asc" } }),
      this.prisma.contactInfo.findUnique({ where: { id: "contacts" } }),
    ]);

    const homeContent = (home?.draftContent ?? { homeFeatures: [], homeCards: [] }) as unknown as HomeDraft;

    return {
      pages: Object.fromEntries(pages.map((page) => [page.slug, page.draftContent as unknown as CmsPage])),
      homeFeatures: homeContent.homeFeatures,
      homeCards: homeContent.homeCards,
      blogPosts: blogPosts.map((item) => item.draftContent as unknown as BlogPost),
      galleryImages: galleryImages.map((item) => item.draftContent as unknown as GalleryImage),
      documents: documents.map((item) => item.draftContent as unknown as DocumentItem),
      contacts: (contacts?.draftContent ?? { phones: [], email: "", address: "" }) as unknown as ContactInfo,
    };
  }

  async savePageDraft(slug: string, content: CmsPage) {
    return this.prisma.page.update({
      where: { slug },
      data: { draftContent: asJson(content) },
    });
  }

  async publishPage(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException("Page not found");

    return this.prisma.page.update({
      where: { slug },
      data: {
        publishedContent: asJson(page.draftContent),
        publishedAt: new Date(),
      },
    });
  }

  async saveHomeDraft(content: HomeDraft) {
    return this.prisma.homeContent.update({
      where: { id: "home" },
      data: { draftContent: asJson(content) },
    });
  }

  async publishHome() {
    const home = await this.prisma.homeContent.findUnique({ where: { id: "home" } });
    if (!home) throw new NotFoundException("Home content not found");

    return this.prisma.homeContent.update({
      where: { id: "home" },
      data: {
        publishedContent: asJson(home.draftContent),
        publishedAt: new Date(),
      },
    });
  }

  async saveBlogDraft(id: string, content: BlogPost) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        slug: content.slug,
        draftContent: asJson(content),
      },
    });
  }

  async publishBlog(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Blog post not found");

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        publishedContent: asJson(post.draftContent),
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async createBlog(content: BlogPost) {
    return this.prisma.blogPost.create({
      data: {
        id: content.id,
        slug: content.slug,
        draftContent: asJson(content),
        publishedContent: asJson(content),
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async deleteBlog(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  async saveGallery(id: string, content: GalleryImage) {
    return this.prisma.galleryImage.update({
      where: { id },
      data: { draftContent: asJson(content) },
    });
  }

  async publishGallery(id: string) {
    const item = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Gallery image not found");

    return this.prisma.galleryImage.update({
      where: { id },
      data: {
        publishedContent: asJson(item.draftContent),
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async createGallery(content: GalleryImage) {
    const count = await this.prisma.galleryImage.count();
    return this.prisma.galleryImage.create({
      data: {
        id: content.id,
        draftContent: asJson(content),
        publishedContent: asJson(content),
        sortOrder: count,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async deleteGallery(id: string) {
    return this.prisma.galleryImage.delete({ where: { id } });
  }

  async reorderGallery(ids: string[]) {
    return this.prisma.$transaction(
      ids.map((id, sortOrder) =>
        this.prisma.galleryImage.update({
          where: { id },
          data: { sortOrder },
        }),
      ),
    );
  }

  async saveDocument(id: string, content: DocumentItem) {
    return this.prisma.documentItem.update({
      where: { id },
      data: { draftContent: asJson(content) },
    });
  }

  async publishDocument(id: string) {
    const item = await this.prisma.documentItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Document not found");

    return this.prisma.documentItem.update({
      where: { id },
      data: {
        publishedContent: asJson(item.draftContent),
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async createDocument(content: DocumentItem) {
    const count = await this.prisma.documentItem.count();
    return this.prisma.documentItem.create({
      data: {
        id: content.id,
        draftContent: asJson(content),
        publishedContent: asJson(content),
        sortOrder: count,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async deleteDocument(id: string) {
    return this.prisma.documentItem.delete({ where: { id } });
  }

  async reorderDocuments(ids: string[]) {
    return this.prisma.$transaction(
      ids.map((id, sortOrder) =>
        this.prisma.documentItem.update({
          where: { id },
          data: { sortOrder },
        }),
      ),
    );
  }

  async saveContactsDraft(content: ContactInfo) {
    return this.prisma.contactInfo.update({
      where: { id: "contacts" },
      data: { draftContent: asJson(content) },
    });
  }

  async publishContacts() {
    const contacts = await this.prisma.contactInfo.findUnique({ where: { id: "contacts" } });
    if (!contacts) throw new NotFoundException("Contacts not found");

    return this.prisma.contactInfo.update({
      where: { id: "contacts" },
      data: {
        publishedContent: asJson(contacts.draftContent),
        publishedAt: new Date(),
      },
    });
  }
}
