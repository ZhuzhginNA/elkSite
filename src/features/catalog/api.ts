import { appConfig } from "../../shared/config";
import { httpGet } from "../../shared/http";
import { mockCatalogItems } from "../../shared/mockData";
import type { CatalogItem } from "../../shared/types";

function normalizeCatalogResponse(payload: unknown): CatalogItem[] {
  if (Array.isArray(payload)) {
    return payload as CatalogItem[];
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown[] }).items)
  ) {
    return (payload as { items: CatalogItem[] }).items;
  }

  return [];
}

export async function fetchCatalogItems(): Promise<CatalogItem[]> {
  if (!appConfig.catalogApiBase) {
    return mockCatalogItems;
  }

  const payload = await httpGet<unknown>(`${appConfig.catalogApiBase}/catalog`);
  return normalizeCatalogResponse(payload);
}
