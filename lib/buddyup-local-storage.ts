/**
 * BuddyUp localStorage keys (historically `edumatch_*`).
 * `migrateLegacyEdumatchToBuddyupOnce` copies legacy keys once on the client.
 */

export const BUDDYUP_QUESTIONNAIRE_KEY = "buddyup_questionnaire";
export const BUDDYUP_MATCH_RESULT_KEY = "buddyup_match_result";
export const BUDDYUP_ADDED_PROGRAMS_KEY = "buddyup_added_programs";
export const BUDDYUP_APPLICATION_STATUS_KEY = "buddyup_application_status";
export const BUDDYUP_DOCUMENT_DRAFTS_KEY = "buddyup_document_drafts";
export const BUDDYUP_DOCUMENT_DRAFT_VERSIONS_KEY = "buddyup_document_draft_versions";
export const BUDDYUP_DOCUMENT_TEMPLATE_SOURCE_META_KEY = "buddyup_document_template_source";
export const BUDDYUP_FAVORITE_PROGRAMS_KEY = "buddyup_favorite_programs";
export const BUDDYUP_ONBOARDING_MATCH_SPOTLIGHT_V1_KEY = "buddyup_onboarding_match_spotlight_v1";
export const BUDDYUP_ONBOARDING_WORKSPACE_SPOTLIGHT_V1_KEY = "buddyup_onboarding_workspace_spotlight_v1";
/** 用户曾进入过工作台：产品侧不再展示前往完整问卷页的入口，背景在「我的背景」维护 */
export const BUDDYUP_WORKSPACE_VISITED_V1_KEY = "buddyup_workspace_visited_v1";

export const BUDDYUP_SCHOOL_HERO_CACHE_PREFIX = "buddyup_school_hero_";

const MIGRATION_FLAG_KEY = "buddyup_storage_migrated_from_edumatch_v1";

const LEGACY_KEY_PAIRS: readonly [legacy: string, next: string][] = [
  ["edumatch_questionnaire", BUDDYUP_QUESTIONNAIRE_KEY],
  ["edumatch_match_result", BUDDYUP_MATCH_RESULT_KEY],
  ["edumatch_added_programs", BUDDYUP_ADDED_PROGRAMS_KEY],
  ["edumatch_application_status", BUDDYUP_APPLICATION_STATUS_KEY],
  ["edumatch_document_drafts", BUDDYUP_DOCUMENT_DRAFTS_KEY],
  ["edumatch_document_draft_versions", BUDDYUP_DOCUMENT_DRAFT_VERSIONS_KEY],
  ["edumatch_document_template_source", BUDDYUP_DOCUMENT_TEMPLATE_SOURCE_META_KEY],
  ["edumatch_favorite_programs", BUDDYUP_FAVORITE_PROGRAMS_KEY],
  ["edumatch_onboarding_match_spotlight_v1", BUDDYUP_ONBOARDING_MATCH_SPOTLIGHT_V1_KEY],
  ["edumatch_onboarding_workspace_spotlight_v1", BUDDYUP_ONBOARDING_WORKSPACE_SPOTLIGHT_V1_KEY],
  ["edumatch_workspace_visited_v1", BUDDYUP_WORKSPACE_VISITED_V1_KEY],
];

const LEGACY_SCHOOL_HERO_PREFIX = "edumatch_school_hero_";

/** Run once per browser profile to preserve data after the `edumatch_*` → `buddyup_*` rename. */
export function migrateLegacyEdumatchToBuddyupOnce(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(MIGRATION_FLAG_KEY)) return;

    for (const [legacyKey, nextKey] of LEGACY_KEY_PAIRS) {
      const legacyVal = window.localStorage.getItem(legacyKey);
      if (legacyVal == null) continue;
      if (window.localStorage.getItem(nextKey) == null) {
        window.localStorage.setItem(nextKey, legacyVal);
      }
      window.localStorage.removeItem(legacyKey);
    }

    const heroKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(LEGACY_SCHOOL_HERO_PREFIX)) heroKeys.push(k);
    }
    for (const legacyKey of heroKeys) {
      const nextKey = legacyKey.replace(LEGACY_SCHOOL_HERO_PREFIX, BUDDYUP_SCHOOL_HERO_CACHE_PREFIX);
      if (window.localStorage.getItem(nextKey) == null) {
        const v = window.localStorage.getItem(legacyKey);
        if (v != null) window.localStorage.setItem(nextKey, v);
      }
      window.localStorage.removeItem(legacyKey);
    }

    window.localStorage.setItem(MIGRATION_FLAG_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}
