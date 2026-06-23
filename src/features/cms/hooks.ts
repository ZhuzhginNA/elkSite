import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBlog,
  createDocumentItem,
  createGalleryImage,
  deleteBlog,
  deleteDocumentItem,
  deleteGalleryImage,
  fetchAdminContent,
  fetchAdminMe,
  fetchBlogPosts,
  fetchCmsContent,
  fetchCmsPage,
  fetchContacts,
  fetchDocuments,
  fetchGalleryImages,
  fetchMediaAssets,
  loginAdmin,
  logoutAdmin,
  publishBlog,
  publishContacts,
  publishDocumentItem,
  publishGalleryImage,
  publishHome,
  publishPage,
  reorderDocumentItems,
  reorderGalleryImages,
  resetLocalContent,
  saveBlogDraft,
  saveContactsDraft,
  saveDocumentItem,
  saveGalleryImage,
  saveHomeDraft,
  saveLocalContent,
  savePageDraft,
  uploadMediaAsset,
} from "./api";
import type { BlogPost, CmsContent, CmsPage, ContactInfo, DocumentItem, GalleryImage } from "../../shared/types";

export function useCmsContent() {
  return useQuery({
    queryKey: ["cms", "content"],
    queryFn: fetchCmsContent,
  });
}

export function useAdminContent(enabled = true) {
  return useQuery({
    queryKey: ["cms", "admin", "content"],
    queryFn: fetchAdminContent,
    enabled,
  });
}

export function useAdminMe() {
  return useQuery({
    queryKey: ["cms", "admin", "me"],
    queryFn: fetchAdminMe,
    retry: false,
  });
}

export function useMediaAssets(enabled = true) {
  return useQuery({
    queryKey: ["cms", "admin", "media"],
    queryFn: fetchMediaAssets,
    enabled,
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

function useAdminMutation<TInput>(mutationFn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms"] });
    },
  });
}

export function useLoginAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms", "admin"] });
    },
  });
}

export function useLogoutAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms", "admin"] });
    },
  });
}

export function useSavePageDraft() {
  return useAdminMutation(({ slug, page, content }: { slug: string; page: CmsPage; content?: CmsContent }) =>
    savePageDraft(slug, page, content),
  );
}

export function usePublishPage() {
  return useAdminMutation((slug: string) => publishPage(slug));
}

export function useSaveHomeDraft() {
  return useAdminMutation(({ payload, content }: { payload: Pick<CmsContent, "homeFeatures" | "homeCards">; content?: CmsContent }) =>
    saveHomeDraft(payload, content),
  );
}

export function usePublishHome() {
  return useAdminMutation(() => publishHome());
}

export function useSaveBlogDraft() {
  return useAdminMutation(({ id, post, content }: { id: string; post: BlogPost; content?: CmsContent }) =>
    saveBlogDraft(id, post, content),
  );
}

export function usePublishBlog() {
  return useAdminMutation((id: string) => publishBlog(id));
}

export function useCreateBlog() {
  return useAdminMutation(({ post, content }: { post: BlogPost; content?: CmsContent }) => createBlog(post, content));
}

export function useDeleteBlog() {
  return useAdminMutation(({ id, content }: { id: string; content?: CmsContent }) => deleteBlog(id, content));
}

export function useSaveGalleryImage() {
  return useAdminMutation(({ id, image, content }: { id: string; image: GalleryImage; content?: CmsContent }) =>
    saveGalleryImage(id, image, content),
  );
}

export function usePublishGalleryImage() {
  return useAdminMutation((id: string) => publishGalleryImage(id));
}

export function useCreateGalleryImage() {
  return useAdminMutation(({ image, content }: { image: GalleryImage; content?: CmsContent }) =>
    createGalleryImage(image, content),
  );
}

export function useDeleteGalleryImage() {
  return useAdminMutation(({ id, content }: { id: string; content?: CmsContent }) => deleteGalleryImage(id, content));
}

export function useReorderGalleryImages() {
  return useAdminMutation(({ ids, content }: { ids: string[]; content?: CmsContent }) =>
    reorderGalleryImages(ids, content),
  );
}

export function useSaveDocumentItem() {
  return useAdminMutation(({ id, document, content }: { id: string; document: DocumentItem; content?: CmsContent }) =>
    saveDocumentItem(id, document, content),
  );
}

export function usePublishDocumentItem() {
  return useAdminMutation((id: string) => publishDocumentItem(id));
}

export function useCreateDocumentItem() {
  return useAdminMutation(({ document, content }: { document: DocumentItem; content?: CmsContent }) =>
    createDocumentItem(document, content),
  );
}

export function useDeleteDocumentItem() {
  return useAdminMutation(({ id, content }: { id: string; content?: CmsContent }) => deleteDocumentItem(id, content));
}

export function useReorderDocumentItems() {
  return useAdminMutation(({ ids, content }: { ids: string[]; content?: CmsContent }) =>
    reorderDocumentItems(ids, content),
  );
}

export function useSaveContactsDraft() {
  return useAdminMutation(({ contacts, content }: { contacts: ContactInfo; content?: CmsContent }) =>
    saveContactsDraft(contacts, content),
  );
}

export function usePublishContacts() {
  return useAdminMutation(() => publishContacts());
}

export function useUploadMediaAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMediaAsset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms", "admin", "media"] });
    },
  });
}
