import { Body, Controller, Get, Header, Param, Post, Put, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { AuthGuard } from "../auth/auth.guard";
import { CatalogService } from "./catalog.service";
import type { CatalogSettings } from "./catalog.types";

@Controller("api")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("catalog/categories")
  getCategories() {
    return this.catalogService.getPublicCategories();
  }

  @Get("catalog/categories/:level1Id/children")
  getCategoryChildren(@Param("level1Id") level1Id: string) {
    return this.catalogService.getPublicCategoryChildren(decodeURIComponent(level1Id));
  }

  @Get("catalog/categories/:categoryId/cards")
  getCardsByCategory(@Param("categoryId") categoryId: string) {
    return this.catalogService.getPublicCardsByCategory(decodeURIComponent(categoryId));
  }

  @Get("catalog/cards/:cardId")
  getCard(@Param("cardId") cardId: string) {
    return this.catalogService.getPublicCard(cardId);
  }

  @Get("catalog/cards/:cardId/images")
  getCardImages(@Param("cardId") cardId: string) {
    return this.catalogService.getPublicCardImages(cardId);
  }

  @Get("catalog/documents/:documentId/download")
  @Header("Cache-Control", "private, max-age=300")
  async downloadDocument(@Param("documentId") documentId: string, @Res() response: Response) {
    const file = await this.catalogService.downloadDocument(documentId);
    response.setHeader("Content-Type", file.contentType);
    response.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
    );
    response.send(file.buffer);
  }

  @UseGuards(AuthGuard)
  @Get("admin/catalog/settings")
  getAdminSettings() {
    return this.catalogService.getAdminSettings();
  }

  @UseGuards(AuthGuard)
  @Put("admin/catalog/settings/draft")
  saveAdminSettingsDraft(@Body() body: CatalogSettings) {
    return this.catalogService.saveSettingsDraft(body);
  }

  @UseGuards(AuthGuard)
  @Post("admin/catalog/settings/publish")
  publishAdminSettings() {
    return this.catalogService.publishSettings();
  }
}
