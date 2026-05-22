import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchBlogPosts,
  fetchCmsContent,
  fetchCmsPage,
  fetchContacts,
  fetchDocuments,
  fetchGalleryImages,
  resetLocalContent,
  saveLocalContent,
} from "./api";
import type { CmsContent } from "../../shared/types";

export function useCmsContent() {
  return useQuery({
    queryKey: ["cms", "content"],
    queryFn: fetchCmsContent,
  });
}

export function useCmsPage(slug: string) {
  return useQuery({
    queryKey: ["cms", "page", slug],
    queryFn: () => fetchCmsPage(slug),
  });
}

export function useGalleryImages() {
  return useQuery({
    queryKey: ["cms", "gallery"],
    queryFn: fetchGalleryImages,
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: ["cms", "documents"],
    queryFn: fetchDocuments,
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["cms", "blog"],
    queryFn: fetchBlogPosts,
  });
}

export function useContacts() {
  return useQuery({
    queryKey: ["cms", "contacts"],
    queryFn: fetchContacts,
  });
}

export function useSaveCmsContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: CmsContent) => {
      saveLocalContent(content);
      return content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms"] });
    },
  });
}

export function useResetCmsContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      resetLocalContent();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms"] });
    },
  });
}
