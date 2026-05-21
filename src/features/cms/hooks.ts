import { useQuery } from "@tanstack/react-query";
import {
  fetchBlogPosts,
  fetchCmsPage,
  fetchContacts,
  fetchDocuments,
  fetchGalleryImages,
} from "./api";

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
