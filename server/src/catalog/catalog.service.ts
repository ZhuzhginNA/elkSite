import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { FrappeClientService } from "./frappe-client.service";
import type {
  CatalogCardDetails,
  CatalogCardImage,
  CatalogCardSummary,
  CatalogCategory,
  CatalogDocument,
  CatalogRelation,
  CatalogSettings,
  FrappeResponse,
  SiteCatalogCardDetails,
} from "./catalog.types";

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

interface DownloadPayload {
  filename: string;
  contentType: string;
  buffer: Buffer;
}

const defaultCatalogSettings: CatalogSettings = {
  hiddenLevel1: [],
  hiddenLevel2: [],
};

const siteCatalogMethods = {
  level1Categories: process.env.CATALOG_SITE_LEVEL1_CATEGORIES_METHOD || "get_site_catalog_level1_categories",
  level2Categories: process.env.CATALOG_SITE_LEVEL2_CATEGORIES_METHOD || "get_site_catalog_level2_categories",
  cards: process.env.CATALOG_SITE_CARDS_METHOD || "get_site_catalog_cards",
  card: process.env.CATALOG_SITE_CARD_METHOD || "get_site_catalog_card",
  cardImages: process.env.CATALOG_SITE_CARD_IMAGES_METHOD || "get_site_catalog_card_images",
  documentDownload: process.env.CATALOG_SITE_DOCUMENT_DOWNLOAD_METHOD || "download_site_document_file",
};

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeSettings(value: unknown): CatalogSettings {
  const input = (value ?? {}) as Partial<CatalogSettings>;

  return {
    hiddenLevel1: Array.isArray(input.hiddenLevel1) ? input.hiddenLevel1.map(String) : [],
    hiddenLevel2: Array.isArray(input.hiddenLevel2) ? input.hiddenLevel2.map(String) : [],
  };
}

function toText(value: unknown) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function toId(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function optionalText(value: unknown) {
  const text = toText(value);
  return text || undefined;
}

function level1Id(code: string) {
  return `l1:${code}`;
}

function level2Id(code1: string, value: string) {
  return `l2:${code1}:${value}`;
}

function parseLevel1Id(categoryId: string) {
  const [, code1] = categoryId.split(":");
  if (!code1) {
    throw new NotFoundException("Категория не найдена");
  }

  return { code1 };
}

function parseLevel2Id(categoryId: string) {
  const [, code1, level2] = categoryId.split(":");
  if (!code1 || !level2) {
    throw new NotFoundException("Категория не найдена");
  }

  return { code1, level2 };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractItems(payload: unknown, key: string) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isRecord(payload) && Array.isArray(payload[key])) {
    return payload[key];
  }

  return [];
}

function normalizeCategory(
  value: unknown,
  level: 1 | 2,
  code1ForLevel2?: string,
): CatalogCategory | null {
  if (!isRecord(value)) {
    return null;
  }

  const categoryValue = toText(value.value ?? value.code ?? value.code1 ?? value.level2_code);
  const label = toText(value.label ?? value.title ?? value.name);
  if (!categoryValue || !label) {
    return null;
  }

  if (level === 1) {
    return {
      id: toText(value.id) || level1Id(categoryValue),
      value: categoryValue,
      label,
      level: 1,
    };
  }

  if (!code1ForLevel2) {
    return null;
  }

  return {
    id: toText(value.id) || level2Id(code1ForLevel2, categoryValue),
    value: categoryValue,
    label,
    level: 2,
    parentId: toText(value.parentId) || level1Id(code1ForLevel2),
  };
}

function normalizeCardSummary(value: unknown, fallbackCategoryId: string): CatalogCardSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = toId(value.id ?? value.card_id ?? value.CARDID);
  const title = toText(value.title ?? value.card_desc ?? value.CARDDESC);
  if (!id || !title) {
    return null;
  }

  return {
    id,
    title,
    code: optionalText(value.code ?? value.full_code ?? value.FULLCODE),
    categoryId: toText(value.categoryId) || fallbackCategoryId,
  };
}

function normalizeDocument(value: unknown): CatalogDocument | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = toId(value.id ?? value.doc_id ?? value.DOCID);
  const title = toText(value.title ?? value.DOCDESC);
  const downloadUrl = toText(value.downloadUrl) || (id ? `/api/catalog/documents/${id}/download` : "");
  if (!id || !title || !downloadUrl) {
    return null;
  }

  return {
    id,
    title,
    downloadUrl,
  };
}

function normalizeRelation(value: unknown): CatalogRelation | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = toId(value.id ?? value.card_id ?? value.CARDID ?? value.ZAMCARDID);
  const title = toText(value.title ?? value.card_desc ?? value.CARDDESC ?? value.name);
  if (!id || !title) {
    return null;
  }

  return {
    id,
    title,
    available: value.available === undefined ? true : Boolean(value.available),
    disabledReason: optionalText(value.disabledReason),
  };
}

function normalizeImage(value: unknown): CatalogCardImage | null {
  if (!isRecord(value)) {
    return null;
  }

  const url = toText(value.url);
  if (!url) {
    return null;
  }

  return {
    url,
    title: toText(value.title ?? value.document_description ?? value.filename) || "Изображение карточки",
    filename: optionalText(value.filename),
  };
}

function isPublicDocument(value: unknown) {
  return isRecord(value) && toText(value.FOR_PUBL ?? value.for_publ).toUpperCase() === "T";
}

@Injectable()
export class CatalogService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly unavailableSiteMethods = new Set<string>();
  private readonly ttlMs = Number(process.env.CATALOG_CACHE_TTL_MS ?? 60 * 60 * 1000);

  constructor(
    private readonly prisma: PrismaService,
    private readonly frappeClient: FrappeClientService,
  ) {}

  async getPublicCategories(): Promise<CatalogCategory[]> {
    const settings = await this.getSettings("published");

    return this.cached("public-categories", async () => {
      const categories = await this.getSiteLevel1Categories();
      return categories.filter((category) => !settings.hiddenLevel1.includes(category.id));
    });
  }

  async getPublicCategoryChildren(level1CategoryId: string): Promise<CatalogCategory[]> {
    const settings = await this.getSettings("published");
    const { code1 } = parseLevel1Id(level1CategoryId);

    if (settings.hiddenLevel1.includes(level1CategoryId)) {
      return [];
    }

    return this.cached(`public-children:${level1CategoryId}`, async () => {
      const categories = await this.getSiteLevel2Categories(code1);
      return categories.filter((category) => !settings.hiddenLevel2.includes(category.id));
    });
  }

  async getPublicCardsByCategory(categoryId: string): Promise<CatalogCardSummary[]> {
    const settings = await this.getSettings("published");
    const { code1, level2 } = parseLevel2Id(categoryId);

    if (settings.hiddenLevel1.includes(level1Id(code1)) || settings.hiddenLevel2.includes(categoryId)) {
      return [];
    }

    return this.cached(`cards:${categoryId}`, async () => this.getSiteCards(categoryId, code1, level2));
  }

  async getPublicCard(cardId: string): Promise<CatalogCardDetails> {
    const card = await this.ensureVisibleCard(cardId);
    return this.toPublicCard(card);
  }

  async getPublicCardImages(cardId: string): Promise<CatalogCardImage[]> {
    await this.ensureVisibleCard(cardId);
    return this.cached(`card-images:${cardId}`, async () => this.getSiteCardImages(cardId));
  }

  async downloadDocument(documentId: string): Promise<DownloadPayload> {
    const publicDocument = await this.findPublicDocumentInAvailableCard(documentId);
    if (!publicDocument) {
      throw new ForbiddenException("Документ недоступен на сайте");
    }

    const response = await this.frappeClient.call<
      FrappeResponse<{ filename: string; content: string; content_type: string }>
    >(siteCatalogMethods.documentDownload, { doc_id: documentId });

    const payload = this.extractResponseData(response);
    if (!payload.content) {
      throw new NotFoundException("Файл документа не найден");
    }

    return {
      filename: payload.filename || publicDocument.title || `document-${documentId}`,
      contentType: payload.content_type || "application/octet-stream",
      buffer: Buffer.from(payload.content, "base64"),
    };
  }

  async getAdminSettings() {
    let categories: CatalogCategory[] = [];
    let catalogError: string | undefined;

    try {
      categories = await this.getRawCategoryTree();
    } catch (error) {
      catalogError = error instanceof Error ? error.message : "Не удалось загрузить категории внешнего каталога";
    }

    return {
      settings: await this.getSettings("draft"),
      publishedSettings: await this.getSettings("published"),
      categories,
      catalogError,
    };
  }

  async saveSettingsDraft(settings: CatalogSettings) {
    const normalized = normalizeSettings(settings);
    const saved = await this.prisma.catalogSettings.upsert({
      where: { id: "catalog" },
      create: {
        id: "catalog",
        draftContent: asJson(normalized),
        publishedContent: asJson(defaultCatalogSettings),
      },
      update: {
        draftContent: asJson(normalized),
      },
    });

    return normalizeSettings(saved.draftContent);
  }

  async publishSettings() {
    const current = await this.ensureSettings();
    const saved = await this.prisma.catalogSettings.update({
      where: { id: "catalog" },
      data: {
        publishedContent: asJson(current.draftContent),
        publishedAt: new Date(),
      },
    });

    this.clearCache();
    return normalizeSettings(saved.publishedContent);
  }

  private async getSiteLevel1Categories() {
    const siteResponse = await this.trySiteMethod<FrappeResponse<{ categories?: unknown[] } | unknown[]>>(
      siteCatalogMethods.level1Categories,
    );
    if (siteResponse) {
      return extractItems(this.extractResponseData(siteResponse), "categories")
        .map((category) => normalizeCategory(category, 1))
        .filter((category): category is CatalogCategory => Boolean(category));
    }

    const response = await this.frappeClient.call<FrappeResponse<{ level1_codes?: unknown[] }>>("get_unique_level1_codes");
    return extractItems(this.extractResponseData(response), "level1_codes")
      .map((category) => normalizeCategory(category, 1))
      .filter((category): category is CatalogCategory => Boolean(category));
  }

  private async getSiteLevel2Categories(code1: string) {
    const siteResponse = await this.trySiteMethod<FrappeResponse<{ categories?: unknown[] } | unknown[]>>(
      siteCatalogMethods.level2Categories,
      { code1, level1_id: level1Id(code1) },
    );
    if (siteResponse) {
      return extractItems(this.extractResponseData(siteResponse), "categories")
        .map((category) => normalizeCategory(category, 2, code1))
        .filter((category): category is CatalogCategory => Boolean(category));
    }

    const response = await this.frappeClient.call<FrappeResponse<{ level2_codes?: Record<string, unknown[]> }>>(
      "get_unique_level2_codes",
      { code1 },
    );
    const payload = this.extractResponseData(response);
    const categories = isRecord(payload.level2_codes) ? payload.level2_codes[code1] ?? [] : [];
    return extractItems(categories, "")
      .map((category) => normalizeCategory(category, 2, code1))
      .filter((category): category is CatalogCategory => Boolean(category));
  }

  private async getSiteCards(categoryId: string, code1: string, level2: string) {
    const siteResponse = await this.trySiteMethod<FrappeResponse<{ cards?: unknown[] } | unknown[]>>(siteCatalogMethods.cards, {
      category_id: categoryId,
      code1,
      level2_code: level2,
    });
    if (siteResponse) {
      return extractItems(this.extractResponseData(siteResponse), "cards")
        .map((card) => normalizeCardSummary(card, categoryId))
        .filter((card): card is CatalogCardSummary => Boolean(card));
    }

    const response = await this.frappeClient.call<FrappeResponse<{ cards?: unknown[] }>>("get_level4_cards_by_l1_l2", {
      code1,
      level2_code: level2,
      limit: 2000,
    });

    return extractItems(this.extractResponseData(response), "cards")
      .map((card) => normalizeCardSummary(card, categoryId))
      .filter((card): card is CatalogCardSummary => Boolean(card));
  }

  private async getSiteCardInternal(cardId: string): Promise<SiteCatalogCardDetails | null> {
    return this.cached(`card:${cardId}`, async () => {
      const siteResponse = await this.trySiteMethod<FrappeResponse<{ card?: unknown } | unknown>>(siteCatalogMethods.card, {
        card_id: cardId,
      });
      if (siteResponse) {
        const payload = this.extractResponseData(siteResponse);
        const rawCard = isRecord(payload) && "card" in payload ? payload.card : payload;
        if (!isRecord(rawCard)) {
          return null;
        }

        return this.normalizeSiteCard(rawCard, cardId);
      }

      const response = await this.frappeClient.call<FrappeResponse<Record<string, unknown>>>("get_card_full_data", {
          card_id: cardId,
        });
        const payload = this.extractResponseData(response);
        if (!isRecord(payload)) {
          return null;
        }

        const documents = extractItems(payload.documents, "")
          .filter((document) => isPublicDocument(document))
          .map((document) => normalizeDocument(document))
          .filter((document): document is CatalogDocument => Boolean(document));
        const zamParts = extractItems(payload.zamParts, "")
          .map((item) => (isRecord(item) ? item.zamCard ?? item : item))
          .map((relation) => normalizeRelation(relation))
          .filter((relation): relation is CatalogRelation => Boolean(relation));
        const card = isRecord(payload.card) ? payload.card : payload;

        return {
          id: toId(card.id ?? card.CARDID ?? cardId),
          title: toText(card.title ?? card.CARDDESC) || `Карточка ${cardId}`,
          comment: optionalText(card.comment ?? card.CARDCOMMENT),
          documents,
          zamParts,
          categoryId: optionalText(card.categoryId) || this.inferCategoryId(card),
        };
    });
  }

  private normalizeSiteCard(rawCard: Record<string, unknown>, fallbackId: string): SiteCatalogCardDetails {
    const documents = extractItems(rawCard.documents, "")
      .map((document) => normalizeDocument(document))
      .filter((document): document is CatalogDocument => Boolean(document));

    const rawZamParts = Array.isArray(rawCard.zamParts)
      ? rawCard.zamParts
      : Array.isArray(rawCard.relations)
        ? rawCard.relations.filter((relation) => isRecord(relation) && toText(relation.type) === "zamPart")
        : [];
    const zamParts = rawZamParts
      .map((relation) => normalizeRelation(relation))
      .filter((relation): relation is CatalogRelation => Boolean(relation));

    return {
      id: toId(rawCard.id ?? rawCard.CARDID ?? fallbackId),
      title: toText(rawCard.title ?? rawCard.CARDDESC) || `Карточка ${fallbackId}`,
      comment: optionalText(rawCard.comment ?? rawCard.CARDCOMMENT),
      documents,
      zamParts,
      categoryId: optionalText(rawCard.categoryId) || this.inferCategoryId(rawCard),
    };
  }

  private async getSiteCardImages(cardId: string): Promise<CatalogCardImage[]> {
    const siteResponse = await this.trySiteMethod<FrappeResponse<{ images?: unknown[] } | unknown[]>>(
      siteCatalogMethods.cardImages,
      { card_id: cardId },
    );
    if (siteResponse) {
      return extractItems(this.extractResponseData(siteResponse), "images")
        .map((image) => normalizeImage(image))
        .filter((image): image is CatalogCardImage => Boolean(image))
        .map((image) => ({
          ...image,
          url: this.absoluteCatalogUrl(image.url),
        }));
    }

    const response = await this.frappeClient.call<FrappeResponse<{ images?: unknown[] }>>("get_card_images", {
      card_id: cardId,
    });

    return extractItems(this.extractResponseData(response), "images")
      .map((image) => normalizeImage(image))
      .filter((image): image is CatalogCardImage => Boolean(image))
      .map((image) => ({
        ...image,
        url: this.absoluteCatalogUrl(image.url),
      }));
  }

  private absoluteCatalogUrl(path: string) {
    if (!path || /^https?:\/\//i.test(path)) {
      return path;
    }

    const base = (process.env.CATALOG_API_BASE ?? "").replace(/\/+$/, "");
    return `${base}${path}`;
  }

  private async ensureVisibleCard(cardId: string) {
    const card = await this.getSiteCardInternal(cardId);
    if (!card) {
      throw new NotFoundException("Карточка не найдена");
    }

    const settings = await this.getSettings("published");
    if (this.isCategoryHidden(card.categoryId, settings) || !card.documents.length) {
      throw new NotFoundException("Карточка недоступна на сайте");
    }

    return card;
  }

  private async findPublicDocumentInAvailableCard(documentId: string): Promise<CatalogDocument | null> {
    const settings = await this.getSettings("published");
    const response = await this.frappeClient.call<FrappeResponse<{ cards?: Array<Record<string, unknown>> }>>(
      "get_document_attached_cards",
      { document_id: documentId },
    );
    const payload = this.extractResponseData(response);
    const cards = extractItems(payload, "cards");

    for (const card of cards) {
      if (!isRecord(card)) {
        continue;
      }

      const cardId = toId(card.CARDID ?? card.id);
      if (!cardId) {
        continue;
      }

      const siteCard = await this.getSiteCardInternal(cardId);
      if (!siteCard || this.isCategoryHidden(siteCard.categoryId, settings)) {
        continue;
      }

      const document = siteCard.documents.find((item) => item.id === documentId);
      if (document) {
        return document;
      }
    }

    return null;
  }

  private async getRawCategoryTree(): Promise<CatalogCategory[]> {
    const categories = await this.getSiteLevel1Categories();
    const childrenLists = await Promise.all(categories.map((category) => this.getSiteLevel2Categories(category.value)));

    return categories.map((category, index) => ({
      ...category,
      children: childrenLists[index],
    }));
  }

  private toPublicCard(card: SiteCatalogCardDetails): CatalogCardDetails {
    return {
      id: card.id,
      title: card.title,
      comment: card.comment,
      documents: card.documents,
      zamParts: card.zamParts,
    };
  }

  private inferCategoryId(card: Record<string, unknown>) {
    const code1 = toText(card.CODE1).padStart(2, "0");
    const code2 = toText(card.CODE2).padStart(2, "0");
    const code3 = toText(card.CODE3).padStart(2, "0");
    const codeType = this.resolveCodeType(code1);
    const subgroup = codeType === "type1" ? code3 : code2;
    if (!code1 || code1 === "00" || !subgroup || subgroup === "00") {
      return undefined;
    }

    return level2Id(code1, `${code1}.${subgroup}`);
  }

  private resolveCodeType(code1: string) {
    const numericCode1 = Number(code1);
    return Number.isFinite(numericCode1) && numericCode1 >= 1 && numericCode1 <= 10 ? "type1" : "type2";
  }

  private isCategoryHidden(categoryId: string | undefined, settings: CatalogSettings) {
    if (!categoryId) {
      return false;
    }

    const { code1 } = parseLevel2Id(categoryId);
    return settings.hiddenLevel1.includes(level1Id(code1)) || settings.hiddenLevel2.includes(categoryId);
  }

  private extractResponseData<T>(response: FrappeResponse<T> | T): T {
    if (response && typeof response === "object" && "data" in response) {
      return (response as FrappeResponse<T>).data as T;
    }

    return response as T;
  }

  private async getSettings(mode: "draft" | "published") {
    const settings = await this.ensureSettings();
    return normalizeSettings(mode === "draft" ? settings.draftContent : settings.publishedContent);
  }

  private async ensureSettings() {
    return this.prisma.catalogSettings.upsert({
      where: { id: "catalog" },
      create: {
        id: "catalog",
        draftContent: asJson(defaultCatalogSettings),
        publishedContent: asJson(defaultCatalogSettings),
      },
      update: {},
    });
  }

  private async cached<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const current = this.cache.get(key) as CacheEntry<T> | undefined;
    if (current && current.expiresAt > Date.now()) {
      return current.value;
    }

    const active = this.inFlight.get(key) as Promise<T> | undefined;
    if (active) {
      return active;
    }

    const pending = factory()
      .then((value) => {
        this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, pending);
    return pending;
  }

  private clearCache() {
    this.cache.clear();
    this.inFlight.clear();
  }

  private async trySiteMethod<T>(
    method: string,
    params: Record<string, string | number | boolean | undefined | null> = {},
  ): Promise<T | null> {
    if (this.unavailableSiteMethods.has(method)) {
      return null;
    }

    try {
      return await this.frappeClient.call<T>(method, params);
    } catch {
      this.unavailableSiteMethods.add(method);
      return null;
    }
  }
}
