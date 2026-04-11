import {
  BUDDYUP_DOCUMENT_DRAFTS_KEY,
  BUDDYUP_DOCUMENT_DRAFT_VERSIONS_KEY,
  BUDDYUP_DOCUMENT_TEMPLATE_SOURCE_META_KEY,
} from "./buddyup-local-storage";
import type { QuestionnaireData } from "./types";

export type DocumentDraftKind = "ps" | "cv" | "why_school" | "rl_outline";

export const DOCUMENT_DRAFT_LABELS: Record<DocumentDraftKind, string> = {
  ps: "个人陈述",
  cv: "简历大纲",
  why_school: "Why School",
  rl_outline: "推荐信提纲",
};

export const DOCUMENT_DRAFT_ORDER: DocumentDraftKind[] = ["ps", "cv", "why_school", "rl_outline"];

const STORAGE_KEY = BUDDYUP_DOCUMENT_DRAFTS_KEY;
const VERSION_STORAGE_KEY = BUDDYUP_DOCUMENT_DRAFT_VERSIONS_KEY;
const TEMPLATE_SOURCE_META_KEY = BUDDYUP_DOCUMENT_TEMPLATE_SOURCE_META_KEY;
/** 与项目草稿同库，键前缀用于四套「模版文书」正文（来自首次写入的项目） */
const TEMPLATE_KEY_PREFIX = "__tmpl__::";
/** 首次生成并保存的 PS，作为全局主文书（用于改写其它文书类型） */
const MASTER_PS_KEY = "__master_ps__";

export interface DocumentDraftPayload {
  content: string;
  updatedAt: string;
  workflow?: DraftWorkflowState;
}

type DraftStore = Record<string, DocumentDraftPayload>;
type DraftVersionStore = Record<string, DocumentDraftVersion[]>;

export interface DocumentDraftVersion {
  id: string;
  content: string;
  createdAt: string;
}

export type MicroTaskStage = "select_materials" | "match_requirements" | "bind_paragraphs" | "refine_draft";

export interface ParagraphBindingCard {
  id: string;
  title: string;
  targetRequirementIds: string[];
  materialIds: string[];
  aiDraft: string;
  editedDraft: string;
}

export interface IntentHistoryItem {
  id: string;
  paragraphId: string;
  intent: "more_specific_results" | "stronger_motivation" | "compress_120_words";
  before: string;
  after: string;
  createdAt: string;
}

export interface SourceTraceItem {
  paragraphId: string;
  materialId: string;
  materialTitle: string;
  excerpt: string;
}

export interface DraftWorkflowState {
  microTaskState: {
    currentStage: MicroTaskStage;
    completedStages: MicroTaskStage[];
  };
  selectedMaterialIds: string[];
  matchedRequirementIds: string[];
  paragraphBindings: ParagraphBindingCard[];
  intentHistory: IntentHistoryItem[];
  sourceTrace: SourceTraceItem[];
  recommendationCache: string[];
  narrativeAnswers?: Record<
    string,
    {
      selectedOption?: string;
      customText?: string;
    }
  >;
}

function templateStorageKey(kind: DocumentDraftKind): string {
  return `${TEMPLATE_KEY_PREFIX}${kind}`;
}

function isTemplateStoreKey(key: string): boolean {
  return key.startsWith(TEMPLATE_KEY_PREFIX);
}

function readMasterPs(): string | null {
  const store = readDraftStore();
  const t = store[MASTER_PS_KEY]?.content?.trim();
  return t ? store[MASTER_PS_KEY]!.content : null;
}

function writeMasterPs(content: string): void {
  const t = content.trim();
  if (!t) return;
  const store = readDraftStore();
  store[MASTER_PS_KEY] = {
    content: t,
    updatedAt: new Date().toISOString(),
  };
  writeDraftStore(store);
}

export function getDefaultPs(): string | null {
  return readMasterPs();
}

export function setDefaultPs(content: string): boolean {
  const t = content.trim();
  if (!t) return false;
  writeMasterPs(t);
  return true;
}

function maybeSetMasterPs(content: string): void {
  if (readMasterPs()) return;
  writeMasterPs(content);
}

interface TemplateSourceMeta {
  /** 作为模版来源的项目 id；首次非空保存时锁定 */
  sourceProgramId: string | null;
}

function readTemplateSourceMeta(): TemplateSourceMeta {
  if (typeof window === "undefined") return { sourceProgramId: null };
  try {
    const raw = localStorage.getItem(TEMPLATE_SOURCE_META_KEY);
    if (!raw) return { sourceProgramId: null };
    const p = JSON.parse(raw) as unknown;
    if (typeof p === "object" && p !== null && "sourceProgramId" in p) {
      const id = (p as { sourceProgramId: unknown }).sourceProgramId;
      return { sourceProgramId: typeof id === "string" ? id : null };
    }
  } catch {
    /* ignore */
  }
  return { sourceProgramId: null };
}

function writeTemplateSourceMeta(meta: TemplateSourceMeta): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(TEMPLATE_SOURCE_META_KEY, JSON.stringify(meta));
    return true;
  } catch {
    return false;
  }
}

function readTemplateKind(kind: DocumentDraftKind): string | null {
  const store = readDraftStore();
  const payload = store[templateStorageKey(kind)];
  const t = payload?.content?.trim();
  return t ? payload!.content : null;
}

function writeTemplateKind(kind: DocumentDraftKind, content: string): void {
  const store = readDraftStore();
  store[templateStorageKey(kind)] = {
    content,
    updatedAt: new Date().toISOString(),
  };
  writeDraftStore(store);
}

export interface DraftContext {
  schoolName: string;
  schoolNameEn: string;
  programName: string;
  programNameEn: string;
  degree: string;
  department: string;
  deadline: string;
}

export function buildProjectHeader(ctx: DraftContext): string {
  return `【${ctx.schoolNameEn} — ${ctx.programNameEn}】\nDegree: ${ctx.degree} | Department: ${ctx.department} | Deadline: ${ctx.deadline}\n\n`;
}

function nz(s: string | undefined | null): string | null {
  const t = s?.trim();
  return t ? t : null;
}

const FUNDING_CN: Record<string, string> = {
  self: "自费",
  scholarship: "奖学金",
  mixed: "混合来源",
};
const LANG_CN: Record<string, string> = {
  english: "英文授课为主",
  bilingual_ok: "可接受中英双语",
  any: "不限授课语言",
};

/** 将问卷内容整理为文书内可引用的背景段落（无有效内容时返回空串） */
export function formatQuestionnaireBackgroundBlock(q: QuestionnaireData): string {
  const out: string[] = [];
  const p = q.personalInfo;

  const basic: string[] = [];
  if (nz(p.intendedMajor)) basic.push(`目标专业：${p.intendedMajor.trim()}`);
  if (nz(p.intendedApplicationField)) basic.push(`申请领域：${p.intendedApplicationField.trim()}`);
  if (nz(p.targetSemester)) basic.push(`目标入学：${p.targetSemester.trim()}`);
  if (nz(p.plannedStudyDuration)) basic.push(`期望学制：${p.plannedStudyDuration.trim()}`);
  if (p.targetCountry?.length) basic.push(`目标地区：${p.targetCountry.join("、")}`);
  if (nz(p.budgetEstimate)) basic.push(`预算参考：${p.budgetEstimate.trim()}`);
  if (p.fundingIntent && FUNDING_CN[p.fundingIntent]) basic.push(`经费意向：${FUNDING_CN[p.fundingIntent]}`);
  if (p.teachingLanguagePref && LANG_CN[p.teachingLanguagePref]) {
    basic.push(`授课语言偏好：${LANG_CN[p.teachingLanguagePref]}`);
  }
  if (nz(p.motivationNote)) basic.push(`申请动机（问卷摘要）：${p.motivationNote.trim()}`);
  if (nz(p.researchInterestNote)) basic.push(`研究兴趣：${p.researchInterestNote.trim()}`);
  if (nz(p.futurePlan)) basic.push(`未来规划：${p.futurePlan.trim()}`);
  if (nz(p.otherApplicationNotes)) basic.push(`其他申请补充：${p.otherApplicationNotes.trim()}`);
  if (nz(p.knownTargetSchools)) basic.push(`意向院校：${p.knownTargetSchools.trim()}`);
  if (basic.length) {
    out.push("【个人与申请意向】");
    out.push(...basic);
    out.push("");
  }

  if (q.education.length > 0) {
    out.push("【教育背景】");
    for (const e of q.education) {
      const head = [e.school, e.major, e.degree].filter(Boolean).join(" · ");
      const meta = [nz(e.gpa) && `成绩 ${e.gpa}`, nz(e.startDate) || nz(e.endDate) ? `${e.startDate} – ${e.endDate}` : null]
        .filter(Boolean)
        .join(" ｜ ");
      out.push(`- ${head}${meta ? `（${meta}）` : ""}`);
      if (nz(e.achievements)) out.push(`  补充：${e.achievements!.trim()}`);
    }
    out.push("");
  }

  if (q.workExperience.length > 0) {
    out.push("【工作与实习】");
    for (const w of q.workExperience) {
      const title = `${w.company} · ${w.position}${w.isCurrent ? "（至今）" : ""}（${w.startDate} – ${w.endDate}）`;
      const star = [nz(w.situation), nz(w.task), nz(w.action), nz(w.result)].filter(Boolean).join("｜");
      out.push(`- ${title}`);
      if (star) out.push(`  ${star.length > 220 ? `${star.slice(0, 218)}…` : star}`);
    }
    out.push("");
  }

  if (q.projects.length > 0) {
    out.push("【项目经历】");
    for (const pr of q.projects) {
      const title = `${pr.name} · ${pr.role}（${pr.startDate} – ${pr.endDate}）`;
      const star = [nz(pr.situation), nz(pr.task), nz(pr.action), nz(pr.result)].filter(Boolean).join("｜");
      out.push(`- ${title}`);
      if (star) out.push(`  ${star.length > 220 ? `${star.slice(0, 218)}…` : star}`);
    }
    out.push("");
  }

  if (q.honors.length > 0) {
    out.push("【荣誉奖项】");
    for (const h of q.honors) {
      out.push(`- ${h.name}（${h.issuer}，${h.date}）${nz(h.description) ? ` — ${h.description!.trim()}` : ""}`);
    }
    out.push("");
  }

  if (q.skills.length > 0) {
    out.push("【技能】");
    const byCat: Record<string, string[]> = {};
    for (const s of q.skills) {
      const cat =
        s.category === "technical"
          ? "技术"
          : s.category === "language"
            ? "语言"
            : s.category === "soft"
              ? "软技能"
              : "其他";
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(s.name);
    }
    for (const [cat, names] of Object.entries(byCat)) {
      out.push(`- ${cat}：${names.join("、")}`);
    }
    out.push("");
  }

  return out.join("\n").trim();
}

export function buildDraftSeed(
  kind: DocumentDraftKind,
  ctx: DraftContext,
  questionnaire?: QuestionnaireData | null
): string {
  const header = buildProjectHeader(ctx);
  const bgRaw = questionnaire ? formatQuestionnaireBackgroundBlock(questionnaire).trim() : "";
  const bgPrefix =
    bgRaw.length > 0
      ? `The following "My Background" notes are auto-filled from your questionnaire. Edit, trim, or split them across sections as needed.\n\n${bgRaw}\n\n----------------\n\n`
      : "";

  switch (kind) {
    case "ps":
      return (
        `${header}${bgPrefix}` +
        `1. Motivation for Application (Why this field and program)\n\n` +
        `2. Academic Preparation (Coursework, research, projects, and fit)\n\n` +
        `3. Career / Research Goals (Short, mid, and long term)\n\n` +
        `4. Why This University and Program (Courses, faculty, resources)\n\n` +
        `5. Closing (Summary and expectations)\n`
      );
    case "cv":
      return (
        `${header}${bgPrefix}` +
        `（可将上文背景整理为条目；亦可按下述结构补充）\n\n` +
        `教育背景\n- 学校 / 专业 / 时间 / GPA（可选）\n\n` +
        `研究 / 项目\n- 标题 · 角色 · 要点（量化成果优先）\n\n` +
        `实习 / 工作\n- 公司 · 职位 · 职责与成果\n\n` +
        `技能与证书\n- 技术栈 / 语言 / 标化（按需）\n\n` +
        `荣誉与其他\n`
      );
    case "why_school":
      return (
        `${header}${bgPrefix}` +
        `1. 与职业/研究目标的契合点\n\n` +
        `2. 具体吸引我的课程、实验室或资源（写清名称）\n\n` +
        `3. 我能为项目/社群带来的贡献\n\n` +
        `4. 结尾：总结与就读意愿\n`
      );
    case "rl_outline":
      return (
        `${header}${bgPrefix}` +
        `推荐人角色与认识场景：\n\n` +
        `希望推荐人强调的 3 个能力/事例：\n` +
        `1.\n2.\n3.\n\n` +
        `与该项目相关的细节（便于推荐人落笔）：\n\n`
      );
    default:
      return `${header}${bgPrefix}`;
  }
}

export function draftStorageKey(programId: string, kind: DocumentDraftKind): string {
  return `${programId}::${kind}`;
}

function versionStorageKey(programId: string, kind: DocumentDraftKind): string {
  return `${programId}::${kind}`;
}

export function readDraftStore(): DraftStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as DraftStore)
      : {};
  } catch {
    return {};
  }
}

export function writeDraftStore(store: DraftStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function readDraftVersionStore(): DraftVersionStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as DraftVersionStore)
      : {};
  } catch {
    return {};
  }
}

function writeDraftVersionStore(store: DraftVersionStore): void {
  localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(store));
}

export function saveDraftVersion(programId: string, kind: DocumentDraftKind, content: string): DocumentDraftVersion | null {
  const trimmed = content.trim();
  if (!trimmed) return null;
  const store = readDraftVersionStore();
  const key = versionStorageKey(programId, kind);
  const list = store[key] ?? [];
  const version: DocumentDraftVersion = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    content,
    createdAt: new Date().toISOString(),
  };
  // 仅保留最近 30 个版本，避免本地存储无限增长
  store[key] = [version, ...list].slice(0, 30);
  writeDraftVersionStore(store);
  return version;
}

export function listDraftVersions(programId: string, kind: DocumentDraftKind): DocumentDraftVersion[] {
  const store = readDraftVersionStore();
  const key = versionStorageKey(programId, kind);
  const list = store[key] ?? [];
  return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getDraft(programId: string, kind: DocumentDraftKind): DocumentDraftPayload | null {
  const store = readDraftStore();
  return store[draftStorageKey(programId, kind)] ?? null;
}

/** 去掉文书顶部的「学校·项目」抬头块，保留正文供套用到其他项目 */
function extractBodyAfterHeader(content: string): string {
  const lines = content.split("\n");
  if (lines[0]?.startsWith("【") && lines[0].includes("】")) {
    let i = 1;
    while (
      i < lines.length &&
      lines[i] !== undefined &&
      !lines[i]!.includes("学位：") &&
      !lines[i]!.startsWith("Degree:")
    ) {
      i++;
    }
    if (i < lines.length && (lines[i]?.includes("学位：") || lines[i]?.startsWith("Degree:"))) {
      i++;
      while (i < lines.length && lines[i]?.trim() === "") {
        i++;
      }
      return lines.slice(i).join("\n");
    }
  }
  const idx = content.indexOf("\n\n");
  return idx >= 0 ? content.slice(idx + 2) : content;
}

/** 项目抬头（与文书内第一、二行格式一致，用于套用模版时替换抬头） */
export function buildDraftSeedHeader(_kind: DocumentDraftKind, ctx: DraftContext): string {
  return buildProjectHeader(ctx);
}

function mergeTemplateWithContext(kind: DocumentDraftKind, ctx: DraftContext, templateFull: string): string {
  return buildDraftSeedHeader(kind, ctx) + extractBodyAfterHeader(templateFull);
}

function summarizeMasterPs(masterPs: string, max = 520): string {
  const body = extractBodyAfterHeader(masterPs).replace(/\s+/g, " ").trim();
  if (!body) return "";
  return body.length > max ? `${body.slice(0, max - 1)}…` : body;
}

function buildDraftFromMasterPs(
  kind: DocumentDraftKind,
  ctx: DraftContext,
  masterPs: string,
  questionnaire?: QuestionnaireData | null
): string {
  const header = buildProjectHeader(ctx);
  const masterSummary = summarizeMasterPs(masterPs);
  const bgRaw = questionnaire ? formatQuestionnaireBackgroundBlock(questionnaire).trim() : "";
  const bgPrefix =
    bgRaw.length > 0
      ? `以下「我的背景」根据问卷自动填入，可按文书需要删改或拆入各段。\n\n${bgRaw}\n\n————————\n\n`
      : "";

  if (kind === "cv") {
    return (
      `${header}${bgPrefix}` +
      `以下内容基于你的主文书（PS）快速改写，请按目标学校要求补充量化细节。\n\n` +
      `【主文书关键信息摘要】\n${masterSummary}\n\n` +
      `教育背景\n- 学校 / 专业 / 时间 / GPA（可选）\n\n` +
      `研究 / 项目\n- 标题 · 角色 · 关键动作 · 可量化结果\n\n` +
      `实习 / 工作\n- 公司 · 职位 · 贡献与影响\n\n` +
      `技能与证书\n- 技术栈 / 语言 / 标化（按需）\n\n` +
      `荣誉与其他\n`
    );
  }

  if (kind === "why_school") {
    return (
      `${header}${bgPrefix}` +
      `以下内容基于你的主文书（PS）快速改写，请补充该校具体课程、实验室与项目资源名称。\n\n` +
      `【主文书关键信息摘要】\n${masterSummary}\n\n` +
      `1. 与职业/研究目标的契合点\n\n` +
      `2. 具体吸引我的课程、实验室或资源（写清名称）\n\n` +
      `3. 我能为项目/社群带来的贡献\n\n` +
      `4. 结尾：总结与就读意愿\n`
    );
  }

  if (kind === "rl_outline") {
    return (
      `${header}${bgPrefix}` +
      `以下提纲基于你的主文书（PS）快速改写，便于推荐人快速抓住重点。\n\n` +
      `【主文书关键信息摘要】\n${masterSummary}\n\n` +
      `推荐人角色与认识场景：\n\n` +
      `希望推荐人强调的 3 个能力/事例：\n1.\n2.\n3.\n\n` +
      `与该项目相关的细节（便于推荐人落笔）：\n\n`
    );
  }

  return `${header}${bgPrefix}${masterSummary}`;
}

/** 演示/预览：将带抬头的模版全文换为当前项目的抬头（与空白稿「套用模版」一致） */
export function mergeDraftTemplateWithContext(
  kind: DocumentDraftKind,
  ctx: DraftContext,
  templateFull: string
): string {
  return mergeTemplateWithContext(kind, ctx, templateFull);
}

/** 同步模版：把来源项目当前四类非空草稿写入模版库 */
function syncTemplateKindsFromProgram(programId: string): void {
  for (const k of DOCUMENT_DRAFT_ORDER) {
    const d = getDraft(programId, k);
    if (d?.content?.trim()) {
      writeTemplateKind(k, d.content);
    }
  }
}

/** 当前星标模版来源项目 id（无则 null） */
export function getTemplateSourceProgramId(): string | null {
  return readTemplateSourceMeta().sourceProgramId;
}

/** 判断某项目是否为当前星标模版来源 */
export function isTemplateSourceProgram(programId: string): boolean {
  return getTemplateSourceProgramId() === programId;
}

/** 将某项目设为星标模版来源，并立即同步该项目已有草稿到模版库 */
export function setTemplateSourceProgram(programId: string): boolean {
  if (!programId) return false;
  const ok = writeTemplateSourceMeta({ sourceProgramId: programId });
  if (!ok) return false;
  syncTemplateKindsFromProgram(programId);
  return true;
}

/** 清除当前星标模版来源 */
export function clearTemplateSourceProgram(): boolean {
  return writeTemplateSourceMeta({ sourceProgramId: null });
}

function updateTemplateAfterSave(programId: string, kind: DocumentDraftKind, content: string): void {
  if (typeof window === "undefined") return;
  if (!content.trim()) return;
  const meta = readTemplateSourceMeta();
  if (meta.sourceProgramId == null) {
    writeTemplateSourceMeta({ sourceProgramId: programId });
    syncTemplateKindsFromProgram(programId);
  } else if (meta.sourceProgramId === programId) {
    writeTemplateKind(kind, content);
  }
}

/**
 * 读取编辑器初始正文：已有草稿优先；否则若有「模版文书」则套用当前项目抬头 + 模版正文；否则默认提纲。
 */
export function getResolvedDraftContent(
  programId: string,
  kind: DocumentDraftKind,
  ctx: DraftContext,
  questionnaire?: QuestionnaireData | null
): string {
  const existing = getDraft(programId, kind);
  if (existing?.content?.trim()) return existing.content;
  const tmpl = readTemplateKind(kind);
  if (tmpl?.trim()) return mergeTemplateWithContext(kind, ctx, tmpl);
  if (kind !== "ps") {
    const masterPs = readMasterPs();
    if (masterPs?.trim()) {
      return buildDraftFromMasterPs(kind, ctx, masterPs, questionnaire ?? null);
    }
  }
  return buildDraftSeed(kind, ctx, questionnaire ?? null);
}

/**
 * 用于文书页「预览范例」：与当前草稿是否已保存无关。
 * defaultSeed = 无模版时的默认提纲（含项目抬头与问卷背景）；
 * templatePreview = 若本地已有模版正文，则展示套用到当前项目抬头后的全文。
 */
export function getDraftExamplePreview(
  kind: DocumentDraftKind,
  ctx: DraftContext,
  questionnaire: QuestionnaireData | null | undefined
): { defaultSeed: string; templatePreview: string | null } {
  const defaultSeed = buildDraftSeed(kind, ctx, questionnaire ?? null);
  const tmpl = readTemplateKind(kind);
  const templatePreview = tmpl?.trim()
    ? mergeTemplateWithContext(kind, ctx, tmpl)
    : null;
  return { defaultSeed, templatePreview };
}

export function saveDraft(programId: string, kind: DocumentDraftKind, content: string): void {
  const store = readDraftStore();
  const prevWorkflow = store[draftStorageKey(programId, kind)]?.workflow;
  store[draftStorageKey(programId, kind)] = {
    content,
    updatedAt: new Date().toISOString(),
    workflow: prevWorkflow,
  };
  writeDraftStore(store);
  if (kind === "ps" && content.trim()) {
    // 首次有效 PS 自动锁定为主文书，供后续其它文书快速改写
    maybeSetMasterPs(content);
  }
  updateTemplateAfterSave(programId, kind, content);
}

export function saveDraftWorkflow(
  programId: string,
  kind: DocumentDraftKind,
  workflow: DraftWorkflowState
): void {
  const store = readDraftStore();
  const key = draftStorageKey(programId, kind);
  const prev = store[key];
  store[key] = {
    content: prev?.content ?? "",
    updatedAt: new Date().toISOString(),
    workflow,
  };
  writeDraftStore(store);
}

export function getProgramIdsWithSavedDrafts(): Set<string> {
  const store = readDraftStore();
  const ids = new Set<string>();
  for (const key of Object.keys(store)) {
    if (isTemplateStoreKey(key)) continue;
    if (store[key]?.content?.trim()) {
      const pid = key.split("::")[0];
      if (pid) ids.add(pid);
    }
  }
  return ids;
}

/** 清空某个项目下全部文书草稿与版本（用于「创建新的」） */
export function clearProgramDrafts(programId: string): void {
  const draftStore = readDraftStore();
  const draftPrefix = `${programId}::`;
  for (const key of Object.keys(draftStore)) {
    if (key.startsWith(draftPrefix)) {
      delete draftStore[key];
    }
  }
  writeDraftStore(draftStore);

  const versionStore = readDraftVersionStore();
  for (const key of Object.keys(versionStore)) {
    if (key.startsWith(draftPrefix)) {
      delete versionStore[key];
    }
  }
  writeDraftVersionStore(versionStore);
}

/** 有非空内容的文书，按项目聚合，用于工作台「我的文书」列表 */
export interface ProgramDraftSummary {
  programId: string;
  lastUpdated: string;
  kinds: DocumentDraftKind[];
}

export function listProgramDraftSummaries(): ProgramDraftSummary[] {
  const store = readDraftStore();
  const byProgram: Record<string, { kinds: DocumentDraftKind[]; last: string }> = {};

  for (const key of Object.keys(store)) {
    if (isTemplateStoreKey(key)) continue;
    const sep = key.indexOf("::");
    if (sep < 0) continue;
    const pid = key.slice(0, sep);
    const kind = key.slice(sep + 2) as DocumentDraftKind;
    if (!pid || !DOCUMENT_DRAFT_ORDER.includes(kind)) continue;
    const payload = store[key];
    if (!payload?.content?.trim()) continue;

    if (!byProgram[pid]) {
      byProgram[pid] = { kinds: [], last: payload.updatedAt };
    }
    if (!byProgram[pid].kinds.includes(kind)) {
      byProgram[pid].kinds.push(kind);
    }
    if (payload.updatedAt > byProgram[pid].last) {
      byProgram[pid].last = payload.updatedAt;
    }
  }

  return Object.entries(byProgram)
    .map(([programId, v]) => ({
      programId,
      lastUpdated: v.last,
      kinds: DOCUMENT_DRAFT_ORDER.filter((k) => v.kinds.includes(k)),
    }))
    .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));
}
