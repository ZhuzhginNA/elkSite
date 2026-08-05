import { useParams } from "react-router-dom";
import { useCatalogCategories } from "../features/catalog/hooks";
import { ContentState } from "../ui/ContentState";
import { CatalogCardPage } from "./CatalogCardPage";
import { CatalogPage } from "./CatalogPage";

export function CatalogEntryPage() {
  const { level1Value } = useParams();
  const categoriesQuery = useCatalogCategories();

  if (categoriesQuery.isLoading) {
    return <ContentState>{"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u043a\u0430\u0442\u0430\u043b\u043e\u0433..."}</ContentState>;
  }

  if (categoriesQuery.isError) {
    return <CatalogCardPage legacyCardId={level1Value} />;
  }

  const isCategoryRoute = (categoriesQuery.data ?? []).some((category) => category.value === level1Value);
  return isCategoryRoute ? <CatalogPage /> : <CatalogCardPage legacyCardId={level1Value} />;
}
