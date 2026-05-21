import { useQuery } from "@tanstack/react-query";
import { fetchCatalogItems } from "./api";

export function useCatalogItems() {
  return useQuery({
    queryKey: ["catalog", "items"],
    queryFn: fetchCatalogItems,
  });
}
