import { generatePath } from "react-router-dom";

export function catalogRootPath() {
  return "/catalog";
}

export function catalogLevel1Path(level1Value: string) {
  return generatePath("/catalog/:level1Value", { level1Value });
}

export function catalogLevel2Path(level1Value: string, level2Value: string) {
  return generatePath("/catalog/:level1Value/:level2Value", {
    level1Value,
    level2Value,
  });
}

function parseCategoryRouteValues(categoryId?: string | null) {
  if (!categoryId) {
    return null;
  }

  const [level, level1Value, rawLevel2Value] = categoryId.split(":");
  if (level !== "l2" || !level1Value || !rawLevel2Value) {
    return null;
  }

  return { level1Value, level2Value: rawLevel2Value };
}

export function catalogCardPath(cardId: string, level1Value?: string, level2Value?: string) {
  if (level1Value && level2Value) {
    return generatePath("/catalog/:level1Value/:level2Value/cards/:cardId", {
      level1Value,
      level2Value,
      cardId,
    });
  }

  return generatePath("/catalog/:cardId", { cardId });
}

export function relatedCatalogCardPath(
  cardId: string,
  categoryId?: string,
  fallbackLevel1Value?: string,
  fallbackLevel2Value?: string,
) {
  const parsedCategory = parseCategoryRouteValues(categoryId);
  if (parsedCategory) {
    return catalogCardPath(cardId, parsedCategory.level1Value, parsedCategory.level2Value);
  }

  return catalogCardPath(cardId, fallbackLevel1Value, fallbackLevel2Value);
}
