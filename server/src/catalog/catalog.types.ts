import type {
  CatalogCardDetails,
  CatalogCardImage,
  CatalogCardSummary,
  CatalogCategory,
  CatalogDocument,
  CatalogRelation,
  CatalogSettings,
} from "../../../src/shared/types";

export type {
  CatalogCardDetails,
  CatalogCardImage,
  CatalogCardSummary,
  CatalogCategory,
  CatalogDocument,
  CatalogRelation,
  CatalogSettings,
};

export interface FrappeResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  [key: string]: unknown;
}

export interface SiteCatalogCardDetails extends CatalogCardDetails {
  categoryId?: string;
}
