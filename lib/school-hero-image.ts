import type { School } from "./types";

const SCHOOL_WIKI_TITLE: Record<string, string> = {
  mit: "Massachusetts_Institute_of_Technology",
  stanford: "Stanford_University",
  cmu: "Carnegie_Mellon_University",
  oxford: "University_of_Oxford",
  cambridge: "University_of_Cambridge",
  columbia: "Columbia_University",
  duke: "Duke_University",
  nyu: "New_York_University",
  ucl: "University_College_London",
  imperial: "Imperial_College_London",
  nus: "National_University_of_Singapore",
  utoronto: "University_of_Toronto",
  hku: "University_of_Hong_Kong",
  bu: "Boston_University",
  usc: "University_of_Southern_California",
  manchester: "University_of_Manchester",
  edinburgh: "University_of_Edinburgh",
  ubc: "University_of_British_Columbia",
};

const CACHE_PREFIX = "edumatch_school_hero_";

function cacheKey(schoolId: string) {
  return `${CACHE_PREFIX}${schoolId}`;
}

type WikiSummaryResponse = {
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
};

export async function resolveSchoolHeroImage(school: Pick<School, "id" | "nameEn">): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const key = cacheKey(school.id);
  const cached = window.localStorage.getItem(key);
  if (cached) return cached;

  const title = SCHOOL_WIKI_TITLE[school.id];
  if (!title) return null;

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSummaryResponse;
    const hero = data.originalimage?.source || data.thumbnail?.source || null;
    if (!hero) return null;
    window.localStorage.setItem(key, hero);
    return hero;
  } catch {
    return null;
  }
}
