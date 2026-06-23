import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ContentService } from "./content.service";
import type { BlogPost, CmsPage, ContactInfo, DocumentItem, GalleryImage, HomeCard } from "../../../src/shared/types";

interface HomeDraftBody {
  homeFeatures: string[];
  homeCards: HomeCard[];
}

@Controller("api")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("content")
  getPublicContent() {
    return this.contentService.getPublicContent();
  }

  @UseGuards(AuthGuard)
  @Get("admin/content")
  getDraftContent() {
    return this.contentService.getDraftContent();
  }

  @UseGuards(AuthGuard)
  @Put("admin/pages/:slug/draft")
  savePageDraft(@Param("slug") slug: string, @Body() body: CmsPage) {
    return this.contentService.savePageDraft(slug, body);
  }

  @UseGuards(AuthGuard)
  @Post("admin/pages/:slug/publish")
  publishPage(@Param("slug") slug: string) {
    return this.contentService.publishPage(slug);
  }

  @UseGuards(AuthGuard)
  @Put("admin/home/draft")
  saveHomeDraft(@Body() body: HomeDraftBody) {
    return this.contentService.saveHomeDraft(body);
  }

  @UseGuards(AuthGuard)
  @Post("admin/home/publish")
  publishHome() {
    return this.contentService.publishHome();
  }

  @UseGuards(AuthGuard)
  @Put("admin/blog/:id/draft")
  saveBlogDraft(@Param("id") id: string, @Body() body: BlogPost) {
    return this.contentService.saveBlogDraft(id, body);
  }

  @UseGuards(AuthGuard)
  @Post("admin/blog/:id/publish")
  publishBlog(@Param("id") id: string) {
    return this.contentService.publishBlog(id);
  }

  @UseGuards(AuthGuard)
  @Post("admin/blog")
  createBlog(@Body() body: BlogPost) {
    return this.contentService.createBlog(body);
  }

  @UseGuards(AuthGuard)
  @Delete("admin/blog/:id")
  deleteBlog(@Param("id") id: string) {
    return this.contentService.deleteBlog(id);
  }

  @UseGuards(AuthGuard)
  @Put("admin/gallery/order")
  reorderGallery(@Body() body: { ids: string[] }) {
    return this.contentService.reorderGallery(body.ids);
  }

  @UseGuards(AuthGuard)
  @Put("admin/gallery/:id")
  saveGallery(@Param("id") id: string, @Body() body: GalleryImage) {
    return this.contentService.saveGallery(id, body);
  }

  @UseGuards(AuthGuard)
  @Post("admin/gallery/:id/publish")
  publishGallery(@Param("id") id: string) {
    return this.contentService.publishGallery(id);
  }

  @UseGuards(AuthGuard)
  @Post("admin/gallery")
  createGallery(@Body() body: GalleryImage) {
    return this.contentService.createGallery(body);
  }

  @UseGuards(AuthGuard)
  @Delete("admin/gallery/:id")
  deleteGallery(@Param("id") id: string) {
    return this.contentService.deleteGallery(id);
  }

  @UseGuards(AuthGuard)
  @Put("admin/documents/order")
  reorderDocuments(@Body() body: { ids: string[] }) {
    return this.contentService.reorderDocuments(body.ids);
  }

  @UseGuards(AuthGuard)
  @Put("admin/documents/:id")
  saveDocument(@Param("id") id: string, @Body() body: DocumentItem) {
    return this.contentService.saveDocument(id, body);
  }

  @UseGuards(AuthGuard)
  @Post("admin/documents/:id/publish")
  publishDocument(@Param("id") id: string) {
    return this.contentService.publishDocument(id);
  }

  @UseGuards(AuthGuard)
  @Post("admin/documents")
  createDocument(@Body() body: DocumentItem) {
    return this.contentService.createDocument(body);
  }

  @UseGuards(AuthGuard)
  @Delete("admin/documents/:id")
  deleteDocument(@Param("id") id: string) {
    return this.contentService.deleteDocument(id);
  }

  @UseGuards(AuthGuard)
  @Put("admin/contacts/draft")
  saveContactsDraft(@Body() body: ContactInfo) {
    return this.contentService.saveContactsDraft(body);
  }

  @UseGuards(AuthGuard)
  @Post("admin/contacts/publish")
  publishContacts() {
    return this.contentService.publishContacts();
  }
}
