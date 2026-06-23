import { appConfig } from "../../shared/config";
import { httpGet, httpPost, httpPut } from "../../shared/http";
import type {
  CatalogCardDetails,
  CatalogCardImage,
  CatalogCardSummary,
  CatalogCategory,
  CatalogSettings,
} from "../../shared/types";

export interface AdminCatalogSettingsPayload {
  settings: CatalogSettings;
  publishedSettings: CatalogSettings;
  categories: CatalogCategory[];
  catalogError?: string;
}

const emptySettings: CatalogSettings = {
  hiddenLevel1: [],
  hiddenLevel2: [],
};

function apiBase() {
  return appConfig.cmsApiBase;
}

export async function fetchCatalogCategories(): Promise<CatalogCategory[]> {
  if (!apiBase()) return [];
  return httpGet<CatalogCategory[]>(`${apiBase()}/catalog/categories`);
}

export async function fetchCatalogCategoryChildren(level1Id: string): Promise<CatalogCategory[]> {
  if (!apiBase() || !level1Id) return [];
  return httpGet<CatalogCategory[]>(`${apiBase()}/catalog/categories/${encodeURIComponent(level1Id)}/children`);
}

export async function fetchCatalogCards(categoryId: string): Promise<CatalogCardSummary[]> {
  if (!apiBase() || !categoryId) return [];
  return httpGet<CatalogCardSummary[]>(`${apiBase()}/catalog/categories/${encodeURIComponent(categoryId)}/cards`);
}

export async function fetchCatalogCard(cardId: string): Promise<CatalogCardDetails> {
  if (!apiBase()) {
    throw new Error("Backend каталога не подключен");
  }

  return httpGet<CatalogCardDetails>(`${apiBase()}/catalog/cards/${encodeURIComponent(cardId)}`);
}

export async function fetchCatalogCardImages(cardId: string): Promise<CatalogCardImage[]> {
  if (!apiBase()) {
    throw new Error("Backend каталога не подключен");
  }

  return httpGet<CatalogCardImage[]>(`${apiBase()}/catalog/cards/${encodeURIComponent(cardId)}/images`);
}

export async function fetchAdminCatalogSettings(): Promise<AdminCatalogSettingsPayload> {
  if (!apiBase()) {
    return { settings: emptySettings, publishedSettings: emptySettings, categories: [] };
  }

  return httpGet<AdminCatalogSettingsPayload>(`${apiBase()}/admin/catalog/settings`);
}

export async function saveAdminCatalogSettingsDraft(settings: CatalogSettings): Promise<CatalogSettings> {
  if (!apiBase()) return settings;
  return httpPut<CatalogSettings>(`${apiBase()}/admin/catalog/settings/draft`, settings);
}

export async function publishAdminCatalogSettings(): Promise<CatalogSettings> {
  if (!apiBase()) return emptySettings;
  return httpPost<CatalogSettings>(`${apiBase()}/admin/catalog/settings/publish`);
}
