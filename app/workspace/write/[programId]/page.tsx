"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DOCUMENT_DRAFT_PREVIEW_SCENES,
  buildDraftPreviewForScene,
  type DraftPreviewSceneId,
} from "@/lib/document-draft-demos";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Check, Eye, FileText, Languages, Plus, Sparkles } from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { useMatchResult, useQuestionnaire } from "@/hooks/use-questionnaire";
import {
  type DocumentDraftKind,
  buildProjectHeader,
  getResolvedDraftContent,
  getDraftExamplePreview,
  listDraftVersions,
  saveDraft,
  saveDraftVersion,
  getProgramIdsWithSavedDrafts,
  type DraftContext,
} from "@/lib/document-drafts";
import type { QuestionnaireData } from "@/lib/types";

function draftContextFromPair(pair: {
  program: { name: string; nameEn: string; degree: string; department: string; deadline: string };
  school: { name: string; nameEn: string };
}): DraftContext {
  const { program, school } = pair;
  return {
    schoolName: school.name,
    schoolNameEn: school.nameEn,
    programName: program.name,
    programNameEn: program.nameEn,
    degree: program.degree,
    department: program.department,
    deadline: program.deadline,
  };
}

function buildPsDraft(ctx: DraftContext, q: QuestionnaireData): string {
  return getResolvedDraftContent("ps-auto", "ps", ctx, q);
}

type BackgroundMaterial = {
  id: string;
  title: string;
  detail: string;
};

function pickBackgroundMaterials(q: QuestionnaireData): BackgroundMaterial[] {
  const out: BackgroundMaterial[] = [];
  if (q.personalInfo.motivationNote.trim()) {
    out.push({ id: "motivation", title: "申请动机", detail: q.personalInfo.motivationNote.trim() });
  }
  if (q.personalInfo.researchInterestNote.trim()) {
    out.push({ id: "research", title: "研究兴趣", detail: q.personalInfo.researchInterestNote.trim() });
  }
  if (q.personalInfo.otherApplicationNotes.trim()) {
    out.push({ id: "other_notes", title: "其他申请补充", detail: q.personalInfo.otherApplicationNotes.trim() });
  }
  q.education.slice(0, 2).forEach((e, i) => {
    const detail = [e.school, e.major, e.degree].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `edu_${i}`, title: `教育经历 ${i + 1}`, detail });
  });
  q.workExperience.slice(0, 2).forEach((w, i) => {
    const detail = [w.company, w.position, w.result].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `work_${i}`, title: `实习/工作 ${i + 1}`, detail });
  });
  q.projects.slice(0, 2).forEach((p, i) => {
    const detail = [p.name, p.role, p.result].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `project_${i}`, title: `项目经历 ${i + 1}`, detail });
  });
  return out;
}

function pickMaterialText(
  materials: BackgroundMaterial[],
  titleIncludes: string,
  fallback: string
): string {
  const hit = materials.find((m) => m.title.includes(titleIncludes));
  return hit?.detail?.trim() || fallback;
}

function normalizeLine(text: string, max = 120): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function buildGeneratedPs(
  ctx: DraftContext,
  structure: "classic" | "story" | "impact",
  materials: BackgroundMaterial[],
  q: QuestionnaireData
): string {
  const header = buildProjectHeader(ctx);
  const major = q.personalInfo.intendedMajor?.trim() || q.personalInfo.intendedApplicationField?.trim() || "目标方向";
  const motivation = normalizeLine(
    pickMaterialText(
      materials,
      "申请动机",
      q.personalInfo.motivationNote || "我希望在硕士阶段系统深化学术能力，并把已有实践经验转化为更稳定的方法论。"
    )
  );
  const research = normalizeLine(
    pickMaterialText(
      materials,
      "研究兴趣",
      q.personalInfo.researchInterestNote || "我关注如何把学术训练与真实问题结合，形成可验证、可复用的解决方案。"
    )
  );
  const edu = normalizeLine(
    pickMaterialText(
      materials,
      "教育经历",
      q.education[0]
        ? `${q.education[0].school} · ${q.education[0].major} · ${q.education[0].degree}`
        : "本科阶段打下了与目标方向相关的课程与方法基础。"
    ),
    150
  );
  const proj = normalizeLine(
    pickMaterialText(
      materials,
      "项目经历",
      q.projects[0]
        ? `${q.projects[0].name} · ${q.projects[0].role} · ${q.projects[0].result || "形成可落地的实践经验"}`
        : "通过项目实践，我逐步形成了从问题定义到方案落地的完整闭环能力。"
    ),
    160
  );
  const work = normalizeLine(
    pickMaterialText(
      materials,
      "实习/工作",
      q.workExperience[0]
        ? `${q.workExperience[0].company} · ${q.workExperience[0].position} · ${q.workExperience[0].result || "积累了跨团队协作经验"}`
        : "在实习与协作场景中，我强化了执行力与沟通能力。"
    ),
    160
  );
  const closeGoal = normalizeLine(
    q.personalInfo.futurePlan ||
      "我希望在完成硕士训练后，继续在相关领域深耕，并把所学转化为长期可持续的职业能力。"
  );

  if (structure === "story") {
    return (
      `${header}` +
      `我与 ${major} 的连接并非一蹴而就，而是从具体问题中逐步形成。${motivation}\n\n` +
      `在学习阶段，我最重要的积累来自：${edu}\n` +
      `这段经历让我建立了清晰的方法意识，也让我意识到自己需要更系统的研究训练。\n\n` +
      `随后在实践中，我通过 ${proj}，把想法转化为可执行方案；而在 ${work} 的过程中，我进一步理解了真实场景对结果质量与协作效率的要求。\n\n` +
      `因此，我希望在 ${ctx.schoolNameEn} 的 ${ctx.programNameEn} 中，围绕既有兴趣继续深入：${research}\n` +
      `我期待将课程训练、项目资源与跨学科环境结合，形成更成熟的研究与实践能力。\n\n` +
      `对我而言，这次申请不仅是学位升级，更是能力结构的重塑。${closeGoal}\n`
    );
  }

  if (structure === "impact") {
    return (
      `${header}` +
      `我申请 ${ctx.programNameEn} 的核心目标，是在 ${major} 方向形成更高质量、可持续输出的能力。${motivation}\n\n` +
      `从准备度来看，我已经具备三类基础：\n` +
      `1) 学术基础：${edu}\n` +
      `2) 项目能力：${proj}\n` +
      `3) 协作与执行：${work}\n\n` +
      `这些经历让我不只关注“做出结果”，也关注结果背后的方法、评估标准与可复用性。基于此，我希望在贵项目中继续推进：${research}\n\n` +
      `我相信，借助 ${ctx.schoolNameEn} 的课程与资源，我可以把现有经验升级为更系统的专业能力，并在团队协作中持续创造价值。${closeGoal}\n`
    );
  }

  return (
    `${header}` +
    `我申请 ${ctx.schoolNameEn} 的 ${ctx.programNameEn}，希望在 ${major} 方向完成从“具备实践经验”到“具备系统方法与研究能力”的进阶。${motivation}\n\n` +
    `在学术准备方面，${edu}。这段学习经历帮助我建立了理论基础，也培养了以问题为导向的学习方式。\n\n` +
    `在实践方面，${proj}；同时，${work}。这些经历让我更清楚地认识到：高质量输出不仅依赖个人能力，也依赖方法设计与跨角色协作。\n\n` +
    `因此，我希望在贵项目中进一步深化以下方向：${research}\n` +
    `我期待通过课程训练、项目实践与师生互动，形成更完整的知识结构与应用能力。\n\n` +
    `若有机会加入该项目，我将以稳定的投入和明确的目标完成硕士阶段训练，并将所学转化为长期价值。${closeGoal}\n`
  );
}

export default function WriteDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const programId = typeof params.programId === "string" ? params.programId : "";
  const { result, isLoaded: matchLoaded } = useMatchResult();
  const { data: questionnaireData, isLoaded: questionnaireLoaded } = useQuestionnaire();

  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [addedIdsReady, setAddedIdsReady] = useState(false);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const kind: DocumentDraftKind = "ps";
  const [content, setContent] = useState("");
  const [zhContent, setZhContent] = useState("");
  const [enContent, setEnContent] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"zh-CN" | "en">("zh-CN");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [translateState, setTranslateState] = useState<"idle" | "translating">("idle");
  const [draftPreviewScene, setDraftPreviewScene] = useState<DraftPreviewSceneId>("current");
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [structure, setStructure] = useState<"classic" | "story" | "impact" | null>(null);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionRefreshTick, setVersionRefreshTick] = useState(0);
  const saveIdleTimer = useRef<number | null>(null);
  /** 避免问卷 data 引用变化时重复覆盖编辑器；换项目时重置 */
  const seededProgramRef = useRef<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("edumatch_added_programs");
    if (raw) {
      try {
        setAddedIds(JSON.parse(raw) as string[]);
      } catch {
        setAddedIds([]);
      }
    }
    setAddedIdsReady(true);
  }, []);

  useEffect(() => {
    setHasLocalDraft(getProgramIdsWithSavedDrafts().has(programId));
  }, [programId]);

  const pair = useMemo(() => {
    if (!result || !programId) return null;
    const program = result.programs.find((p) => p.id === programId);
    if (!program) return null;
    const school = result.schools.find((s) => s.id === program.schoolId);
    if (!school) return null;
    return { program, school };
  }, [result, programId]);

  const draftExample = useMemo(() => {
    if (!pair || !questionnaireLoaded) return null;
    const ctx = draftContextFromPair(pair);
    return getDraftExamplePreview(kind, ctx, questionnaireData);
  }, [pair, kind, questionnaireLoaded, questionnaireData]);

  const draftPreviewPanel = useMemo(() => {
    if (!pair || !draftExample) return null;
    return buildDraftPreviewForScene(draftPreviewScene, kind, draftContextFromPair(pair), draftExample);
  }, [draftPreviewScene, kind, pair, draftExample]);

  const materialPool = useMemo(
    () => (questionnaireLoaded ? pickBackgroundMaterials(questionnaireData) : []),
    [questionnaireLoaded, questionnaireData]
  );

  useEffect(() => {
    setSelectedMaterialIds((prev) => prev.filter((id) => materialPool.some((m) => m.id === id)));
  }, [materialPool]);

  const step1Done = selectedMaterialIds.length > 0;
  const step2Done = structure != null;
  const zhCharCount = useMemo(
    () => (content.match(/[\u4e00-\u9fff]/g) ?? []).length,
    [content]
  );
  const enWordCount = useMemo(
    () => (content.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g) ?? []).length,
    [content]
  );
  const totalCharsNoSpace = useMemo(() => content.replace(/\s+/g, "").length, [content]);
  const draftVersions = useMemo(
    () => (programId ? listDraftVersions(programId, kind) : []),
    [programId, kind, versionRefreshTick]
  );

  async function switchLanguage(target: "en" | "zh-CN") {
    if (target === activeLanguage) return;

    if (activeLanguage === "zh-CN") setZhContent(content);
    if (activeLanguage === "en") setEnContent(content);

    if (target === "zh-CN") {
      setContent(zhContent);
      setActiveLanguage("zh-CN");
      return;
    }

    if (enContent.trim()) {
      setContent(enContent);
      setActiveLanguage("en");
      return;
    }

    const source = (activeLanguage === "zh-CN" ? content : zhContent).trim();
    if (!source) return;

    setTranslateState("translating");
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source, target: "en" }),
      });
      const data = (await r.json()) as { translatedText?: string };
      if (r.ok && data.translatedText) {
        setEnContent(data.translatedText);
        setContent(data.translatedText);
        setActiveLanguage("en");
      }
    } finally {
      setTranslateState("idle");
    }
  }

  function toggleLanguage() {
    if (activeLanguage === "zh-CN") {
      void switchLanguage("en");
      return;
    }
    void switchLanguage("zh-CN");
  }

  function handleSaveVersion() {
    if (!programId) return;
    const saved = saveDraftVersion(programId, kind, content);
    if (!saved) return;
    setVersionRefreshTick((v) => v + 1);
  }

  function restoreVersion(versionContent: string) {
    setContent(versionContent);
    if (activeLanguage === "zh-CN") setZhContent(versionContent);
    if (activeLanguage === "en") setEnContent(versionContent);
    setVersionDialogOpen(false);
  }

  useEffect(() => {
    if (!pair || !questionnaireLoaded) return;
    const pid = pair.program.id;
    if (seededProgramRef.current === pid) return;
    seededProgramRef.current = pid;
    const ctx = draftContextFromPair(pair);
    const seeded = getResolvedDraftContent(pid, "ps", ctx, questionnaireData);
    setZhContent(seeded);
    setEnContent("");
    setActiveLanguage("zh-CN");
    setContent(seeded);
  }, [pair, questionnaireLoaded, questionnaireData]);

  useEffect(() => {
    if (!pair) return;
    setSaveState("saving");
    const debounce = window.setTimeout(() => {
      saveDraft(pair.program.id, kind, content);
      setSaveState("saved");
      if (saveIdleTimer.current != null) window.clearTimeout(saveIdleTimer.current);
      saveIdleTimer.current = window.setTimeout(() => setSaveState("idle"), 1600);
    }, 500);
    return () => window.clearTimeout(debounce);
  }, [content, pair]);

  useEffect(() => {
    return () => {
      if (saveIdleTimer.current != null) window.clearTimeout(saveIdleTimer.current);
    };
  }, []);

  const notAdded = addedIdsReady && !addedIds.includes(programId);
  const canUseEditor = !notAdded || hasLocalDraft;
  const missingMatch = matchLoaded && !result;
  const missingProgram = matchLoaded && result && !pair;

  if (!programId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <GuestBanner />

      <header className="sticky top-8 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/workspace" aria-label="返回工作台">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">文书草稿</p>
              {pair ? (
                <p className="truncate text-xs text-muted-foreground">
                  {pair.school.nameEn} · {pair.program.nameEn}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">—</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            {saveState === "saving" && <span>保存中…</span>}
            {saveState === "saved" && (
              <span className="flex items-center gap-1 text-foreground">
                <Check className="h-3.5 w-3.5" />
                已保存
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-8">
        {missingMatch && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">请先在匹配页生成结果，再把项目加入工作台。</p>
            <Button onClick={() => router.push("/match")}>去匹配</Button>
          </div>
        )}

        {!missingMatch && missingProgram && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            未找到该项目，可能匹配结果已更新。请返回工作台重新选择。
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/workspace">回工作台</Link>
              </Button>
            </div>
          </div>
        )}

        {!missingMatch && !missingProgram && addedIdsReady && notAdded && !hasLocalDraft && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              请先将该项目加入工作台后再写文书；若已有草稿，可从匹配页对应项目的「文书」入口进入。
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/match">去匹配</Link>
              </Button>
              <Button asChild>
                <Link href="/workspace">回工作台</Link>
              </Button>
            </div>
          </div>
        )}

        {pair && (!addedIdsReady || !questionnaireLoaded) && (
          <p className="text-sm text-muted-foreground">加载中…</p>
        )}

        {pair && addedIdsReady && questionnaireLoaded && canUseEditor && (
          <>
            {notAdded && hasLocalDraft && (
              <p className="mb-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                该项目未在工作台列表中，仍可查看与编辑已保存草稿；需要一并管理申请进度时请先在匹配页加入工作台。
              </p>
            )}
            <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-3">
                <section className="flex min-h-[70vh] flex-col rounded-lg border border-border bg-card p-3">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${step1Done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/40 text-foreground"}`}>1</span>
                    挑选个人背景素材
                  </p>
                  {materialPool.length === 0 ? (
                    <p className="flex-1 text-xs text-muted-foreground">问卷素材较少，建议先补充问卷信息。</p>
                  ) : (
                    <ScrollArea className="min-h-0 flex-1 pr-2">
                      <div className="space-y-1.5">
                        {materialPool.map((m) => {
                          const active = selectedMaterialIds.includes(m.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              title={m.detail}
                              onClick={() =>
                                setSelectedMaterialIds((prev) =>
                                  prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                                )
                              }
                              className={`w-full rounded-md border px-2.5 py-2 text-left ${active ? "border-primary/40 bg-muted" : "border-border/70 hover:bg-muted/35"}`}
                            >
                              <p className="text-xs font-medium">{m.title}</p>
                              <p className="mt-1 line-clamp-3 text-ui-label leading-relaxed text-muted-foreground">
                                {m.detail}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </section>

                <section className="rounded-lg border border-border bg-card p-3">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${step2Done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/40 text-foreground"}`}>2</span>
                    选择文书结构
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { id: "classic" as const, label: "经典结构" },
                      { id: "story" as const, label: "故事结构" },
                      { id: "impact" as const, label: "成果结构" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStructure(item.id)}
                        className={`w-full rounded-md border px-2.5 py-2 text-left text-xs ${structure === item.id ? "border-primary/40 bg-muted text-foreground" : "border-border/70 text-muted-foreground hover:bg-muted/35"}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </section>

                {step1Done && step2Done && (
                  <Button
                    type="button"
                    size="sm"
                    className="w-full justify-start gap-1.5"
                    onClick={() => {
                      const ctx = draftContextFromPair(pair);
                      const next = buildGeneratedPs(
                        ctx,
                        structure!,
                        materialPool.filter((m) => selectedMaterialIds.includes(m.id)),
                        questionnaireData
                      );
                      setZhContent(next);
                      setEnContent("");
                      setActiveLanguage("zh-CN");
                      setContent(next);
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    生成PS
                  </Button>
                )}

                <section className="rounded-lg border border-border bg-card p-3">
                  <div className="rounded-md border border-border/70 bg-muted/20 px-2.5 py-2">
                    <p className="text-ui-label font-medium text-foreground">已知限制</p>
                    <p className="mt-1 text-ui-label leading-relaxed text-muted-foreground">
                      当前仅支持按目标领域快速起稿，暂不支持识别每所院校的细分文书偏好。字数、语气、格式与院校特殊要求请手动调整。
                    </p>
                  </div>
                </section>
              </aside>

              <section className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">个人陈述（PS）</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {pair.school.nameEn} · {pair.program.nameEn}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      字符 {totalCharsNoSpace} · 中文 {zhCharCount} · 英文词 {enWordCount}
                    </p>
                    {translateState === "translating" && <p>翻译中…</p>}
                    {saveState === "saving" && <span>保存中…</span>}
                    {saveState === "saved" && (
                      <span className="inline-flex items-center gap-1 text-foreground">
                        <Check className="h-3.5 w-3.5" />
                        已保存
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="重新生成PS提纲"
                          onClick={() => {
                            const ctx = draftContextFromPair(pair);
                            const next = getResolvedDraftContent(pair.program.id, kind, ctx, questionnaireData);
                            setZhContent(next);
                            setEnContent("");
                            setActiveLanguage("zh-CN");
                            setContent(next);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">重新生成PS提纲</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={activeLanguage === "zh-CN" ? "切换到英文" : "切换到中文"}
                          disabled={translateState === "translating" || !zhContent.trim()}
                          onClick={toggleLanguage}
                        >
                          <Languages className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {activeLanguage === "zh-CN" ? "切换到英文" : "切换到中文"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!content.trim()}
                          onClick={handleSaveVersion}
                        >
                          保存版本
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">将当前文稿保存为版本快照</TooltipContent>
                    </Tooltip>
                    <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="icon" aria-label="版本记录">
                              <FileText className="h-4 w-4" aria-hidden />
                            </Button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">版本记录</TooltipContent>
                      </Tooltip>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>版本记录</DialogTitle>
                          <DialogDescription>
                            每次点击「保存版本」会创建一个快照，可随时恢复到该版本。
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] space-y-2 overflow-auto pr-1">
                          {draftVersions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">暂无版本，先点击「保存版本」。</p>
                          ) : (
                            draftVersions.map((v, idx) => (
                              <div key={v.id} className="rounded-md border border-border/70 bg-muted/20 p-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-medium text-foreground">
                                    版本 {draftVersions.length - idx} ·{" "}
                                    {new Date(v.createdAt).toLocaleString("zh-CN", { hour12: false })}
                                  </p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => restoreVersion(v.content)}
                                  >
                                    恢复此版本
                                  </Button>
                                </div>
                                <p className="mt-1 line-clamp-3 text-ui-label leading-relaxed text-muted-foreground">
                                  {v.content.replace(/\s+/g, " ").trim()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      onOpenChange={(open) => {
                        if (open) setDraftPreviewScene("current");
                      }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="icon" aria-label="预览范例">
                              <Eye className="h-4 w-4" aria-hidden />
                            </Button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">预览范例</TooltipContent>
                      </Tooltip>
                      <DialogContent className="flex max-h-[min(92vh,760px)] max-w-2xl flex-col gap-3">
                        <DialogHeader>
                          <DialogTitle>文书预览</DialogTitle>
                          <DialogDescription className="text-left text-sm leading-relaxed">
                            当前为「个人陈述（PS）」。切换下方场景可对照：你本机问卷、几份虚构但信息完整的演示问卷、以及「套用模版」替换抬头后的效果。均为只读预览，不会写入编辑框。
                          </DialogDescription>
                        </DialogHeader>
                        {draftPreviewPanel ? (
                          <div className="flex min-h-0 flex-1 flex-col gap-3">
                            <div className="flex flex-wrap gap-1.5">
                              {DOCUMENT_DRAFT_PREVIEW_SCENES.map((s) => (
                                <Button
                                  key={s.id}
                                  type="button"
                                  size="sm"
                                  variant={draftPreviewScene === s.id ? "default" : "outline"}
                                  className="h-auto min-h-8 max-w-full whitespace-normal px-2.5 py-1.5 text-left text-xs leading-snug"
                                  onClick={() => setDraftPreviewScene(s.id)}
                                >
                                  {s.label}
                                </Button>
                              ))}
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {
                                DOCUMENT_DRAFT_PREVIEW_SCENES.find((s) => s.id === draftPreviewScene)
                                  ?.description
                              }
                            </p>
                            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                              {draftPreviewPanel.blocks.map((block, i) => (
                                <div key={i} className="flex min-h-0 flex-1 flex-col gap-1.5">
                                  <p className="shrink-0 text-xs font-medium text-muted-foreground">
                                    {block.label}
                                  </p>
                                  <ScrollArea className="max-h-[min(42vh,280px)] rounded-md border border-border bg-muted/25 p-3 sm:max-h-[min(38vh,260px)]">
                                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground">
                                      {block.text}
                                    </pre>
                                  </ScrollArea>
                                </div>
                              ))}
                            </div>
                            <p className="text-ui-label leading-relaxed text-muted-foreground">
                              标注「示例」的问卷人物与经历均为虚构演示，与任何真实申请人无关。
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">加载中…</p>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  {content.trim() ? (
                    <Textarea
                      value={content}
                      onChange={(e) => {
                        const next = e.target.value;
                        setContent(next);
                        if (activeLanguage === "zh-CN") setZhContent(next);
                        if (activeLanguage === "en") setEnContent(next);
                      }}
                      className="min-h-[70vh] resize-y border-border/80 font-mono text-sm leading-relaxed shadow-none"
                      spellCheck={false}
                    />
                  ) : (
                    <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/15 px-6 text-center">
                      <div className="mb-4 rounded-full bg-muted p-3">
                        <Sparkles className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">即刻开始创作</p>
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                        可先用默认提纲自动填充，再按你的语气和经历进行精修。
                      </p>
                      <Button
                        type="button"
                        className="mt-4"
                        onClick={() => {
                          const ctx = draftContextFromPair(pair);
                          const next = buildPsDraft(ctx, questionnaireData);
                          setZhContent(next);
                          setEnContent("");
                          setActiveLanguage("zh-CN");
                          setContent(next);
                        }}
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        生成PS
                      </Button>
                    </div>
                  )}
                </div>
                <div className="border-t border-border/70 px-4 py-2">
                  <p className="text-ui-label leading-relaxed text-muted-foreground">
                    提示：本工具用于提速起稿与结构整理，不替代院校官方要求。请在提交前核对字数限制、题目要求、语气风格与事实细节。
                  </p>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
