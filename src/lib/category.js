const normalizeCategory = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function toCategoryArray(category) {
  if (Array.isArray(category)) {
    return category.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof category === "string") {
    const trimmed = category.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item || "").trim()).filter(Boolean);
        }
      } catch {
        // Keep compatibility with plain-string category values.
      }
    }

    return [trimmed];
  }

  if (category && typeof category === "object") {
    return Object.values(category)
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return [];
}

export function getPrimaryCategory(category) {
  return toCategoryArray(category)[0] || "";
}

export function getCategoryText(category, separator = ", ") {
  return toCategoryArray(category).join(separator);
}

export function matchCategory(category, target) {
  const normalizedTarget = normalizeCategory(target);
  if (!normalizedTarget) return "";

  const all = toCategoryArray(category);
  for (const name of all) {
    const normalizedName = normalizeCategory(name);
    if (normalizedName === normalizedTarget || normalizedName.includes(normalizedTarget)) {
      return name;
    }
  }

  return "";
}
