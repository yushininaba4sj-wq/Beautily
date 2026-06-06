import {
  CATEGORY_ORDER,
  PRODUCT_CATALOG,
  type CatalogProduct,
} from "./productCatalog";
import type {
  BeautyPreferences,
  BeautyProfile,
  ProductArea,
  ProductRecommendation,
  RecommendationPlan,
} from "./types";

function matchesAge(product: CatalogProduct, age: number): boolean {
  if (product.ageMin != null && age < product.ageMin) return false;
  if (product.ageMax != null && age > product.ageMax) return false;
  return true;
}

function scoreProduct(
  product: CatalogProduct,
  prefs: BeautyPreferences,
  profile: BeautyProfile | null,
): number {
  let score = 0;
  const personalColor = profile?.personalColor ?? prefs.personalColor;

  if (
    product.skinTypes.length === 0 ||
    product.skinTypes.some((s) => prefs.skinTypes.includes(s))
  ) {
    score += 18;
  } else {
    score -= 8;
  }

  if (
    product.skinConditions.length === 0 ||
    product.skinConditions.some((c) => prefs.skinConditions.includes(c))
  ) {
    score += 12;
  }

  const concernHits = product.concerns.filter((c) => prefs.concerns.includes(c)).length;
  score += concernHits * 14;

  if (product.personalColors.length === 0) {
    score += 6;
  } else if (personalColor && product.personalColors.includes(personalColor)) {
    score += 20;
  } else if (personalColor) {
    score -= 6;
  }

  if (matchesAge(product, prefs.age)) score += 8;

  if (prefs.age >= 28 && product.concerns.includes("しわ")) score += 6;
  if (prefs.age <= 24 && product.concerns.includes("ニキビ")) score += 6;

  if (profile?.matchingStyles.some((s) => product.tags.some((t) => s.includes(t)))) {
    score += 4;
  }

  return score;
}

function toRecommendation(product: CatalogProduct, prefs: BeautyPreferences): ProductRecommendation {
  const tags = [...product.tags];
  if (prefs.skinTypes.some((s) => product.skinTypes.includes(s))) tags.push("肌質マッチ");
  if (prefs.concerns.some((c) => product.concerns.includes(c))) tags.push("悩み対応");

  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    category: product.category,
    area: product.area,
    description: product.description,
    reason: product.reasonTemplate,
    tags: [...new Set(tags)],
  };
}

function pickForArea(
  area: ProductArea,
  budget: number,
  prefs: BeautyPreferences,
  profile: BeautyProfile | null,
): { items: ProductRecommendation[]; total: number } {
  const categories = CATEGORY_ORDER[area];
  const candidates = PRODUCT_CATALOG.filter((p) => p.area === area)
    .map((p) => ({ product: p, score: scoreProduct(p, prefs, profile) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const picked: ProductRecommendation[] = [];
  let spent = 0;
  const usedCategories = new Set<string>();

  for (const category of categories) {
    const best = candidates.find(
      ({ product }) =>
        product.category === category &&
        !usedCategories.has(category) &&
        spent + product.price <= budget,
    );
    if (best) {
      picked.push(toRecommendation(best.product, prefs));
      spent += best.product.price;
      usedCategories.add(category);
    }
  }

  if (picked.length === 0 && budget > 0) {
    const fallback = candidates.find(({ product }) => spent + product.price <= budget);
    if (fallback) {
      picked.push(toRecommendation(fallback.product, prefs));
      spent += fallback.product.price;
    }
  }

  while (spent < budget) {
    const next = candidates.find(
      ({ product }) =>
        !picked.some((p) => p.id === product.id) &&
        spent + product.price <= budget,
    );
    if (!next) break;
    picked.push(toRecommendation(next.product, prefs));
    spent += next.product.price;
  }

  return { items: picked, total: spent };
}

export function buildRecommendationPlan(
  prefs: BeautyPreferences,
  profile: BeautyProfile | null = null,
): RecommendationPlan {
  const skincareBudget = prefs.useCustomBudget
    ? prefs.budgetSkincare
    : Math.round(prefs.monthlyBudget * 0.38);
  const makeupBudget = prefs.useCustomBudget
    ? prefs.budgetMakeup
    : Math.round(prefs.monthlyBudget * 0.32);
  const fashionBudget = prefs.useCustomBudget
    ? prefs.budgetFashion
    : prefs.monthlyBudget - skincareBudget - makeupBudget;

  const skincare = pickForArea("skincare", skincareBudget, prefs, profile);
  const makeup = pickForArea("makeup", makeupBudget, prefs, profile);
  const fashion = pickForArea("fashion", fashionBudget, prefs, profile);

  const grandTotal = skincare.total + makeup.total + fashion.total;
  const budgetCap = prefs.useCustomBudget
    ? skincareBudget + makeupBudget + fashionBudget
    : prefs.monthlyBudget;
  const concernLabel = prefs.concerns.length ? prefs.concerns.join("・") : "バランスケア";
  const skinLabel = prefs.skinTypes.length ? prefs.skinTypes.join("・") : "混合肌想定";
  const pc = profile?.personalColor ?? prefs.personalColor;

  return {
    preferences: prefs,
    skincare: skincare.items,
    makeup: makeup.items,
    fashion: fashion.items,
    skincareTotal: skincare.total,
    makeupTotal: makeup.total,
    fashionTotal: fashion.total,
    grandTotal,
    remainingBudget: Math.max(0, budgetCap - grandTotal),
    summary: `${prefs.age}歳 · ${skinLabel} · ${concernLabel} · 予算¥${prefs.monthlyBudget.toLocaleString()}。${
      pc ? `${pc}向け` : "肌と悩み"
    }に合わせて、スキンケア・メイク・ファッションを選びました。`,
  };
}

export function formatYen(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}
