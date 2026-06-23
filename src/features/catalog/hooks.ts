import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCatalogSettings,
  fetchCatalogCard,
  fetchCatalogCardImages,
  fetchCatalogCards,
  fetchCatalogCategoryChildren,
  fetchCatalogCategories,
  publishAdminCatalogSettings,
  saveAdminCatalogSettingsDraft,
} from "./api";

const catalogStaleTime = 10 * 60 * 1000;

export function useCatalogCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: fetchCatalogCategories,
    staleTime: catalogStaleTime,
  });
}

export function useCatalogCategoryChildren(level1Id: string | null) {
  return useQuery({
    queryKey: ["catalog", "categories", level1Id, "children"],
    queryFn: () => fetchCatalogCategoryChildren(level1Id ?? ""),
    enabled: Boolean(level1Id),
    staleTime: catalogStaleTime,
  });
}

export function useCatalogCards(categoryId: string | null) {
  return useQuery({
    queryKey: ["catalog", "cards", categoryId],
    queryFn: () => fetchCatalogCards(categoryId ?? ""),
    enabled: Boolean(categoryId),
    staleTime: catalogStaleTime,
  });
}

export function useCatalogCard(cardId: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "card", cardId],
    queryFn: () => fetchCatalogCard(cardId ?? ""),
    enabled: Boolean(cardId),
    staleTime: catalogStaleTime,
  });
}

export function useCatalogCardImages(cardId: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "card", cardId, "images"],
    queryFn: () => fetchCatalogCardImages(cardId ?? ""),
    enabled: Boolean(cardId),
    staleTime: catalogStaleTime,
  });
}

export function useAdminCatalogSettings(enabled = true) {
  return useQuery({
    queryKey: ["catalog", "admin", "settings"],
    queryFn: fetchAdminCatalogSettings,
    enabled,
  });
}

export function useSaveAdminCatalogSettingsDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAdminCatalogSettingsDraft,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["catalog", "admin"] });
    },
  });
}

export function usePublishAdminCatalogSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishAdminCatalogSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
}
