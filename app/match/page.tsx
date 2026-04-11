"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, RefreshCw, ChevronRight, LayoutGrid } from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { SchoolCard } from "@/components/match/school-card";
import { SchoolRichInfo } from "@/components/match/school-rich-info";
import { SchoolNotionCover } from "@/components/match/school-notion-cover";
import { ProgramCard } from "@/components/match/program-card";
import { useQuestionnaire, useMatchResult } from "@/hooks/use-questionnaire";
import { useWorkspaceVisited } from "@/hooks/use-workspace-visited";
import { generateMatchResult } from "@/lib/mock-match";
import { getDefaultPs } from "@/lib/document-drafts";
import type { QuestionnaireData, School } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BubbleSpotlightTour, type BubbleSpotlightStep } from "@/components/onboarding/bubble-spotlight-tour";
import { BUDDYUP_ADDED_PROGRAMS_KEY } from "@/lib/buddyup-local-storage";
import { ONBOARDING_MATCH_SPOTLIGHT_V1 } from "@/lib/onboarding-keys";
import { WORKSPACE_BACKGROUND_HREF } from "@/lib/workspace-visited";

type CategoryFilter = "all" | "reach" | "match" | "safety";

const CATEGORY_ITEMS: { id: CategoryFilter; label: string; index: string }[] = [
  { id: "all", label: "全部", index: "01" },
  { id: "reach", label: "冲刺", index: "02" },
  { id: "match", label: "主申", index: "03" },
  { id: "safety", label: "保底", index: "04" },
];

function uniqueProgramIds(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => typeof id === "string" && id.length > 0))];
}

interface AnalysisStep {
  title: string;
  details: string;
}

function buildAnalysisSteps(data: QuestionnaireData): AnalysisStep[] {
  const personal = data.personalInfo;
  const countries = personal.targetCountry.length > 0
    ? personal.targetCountry.join(" / ")
    : "未明确目标国家";
  const major = personal.intendedMajor || personal.intendedApplicationField || "未明确目标方向";
  const budget = personal.budgetEstimate || "未填写预算";
  const duration = personal.plannedStudyDuration || "学制偏好未填写";
  const eduTop = data.education[0];
  const eduSummary = eduTop
    ? `${eduTop.school || "院校未填写"} · ${eduTop.major || "专业未填写"} · GPA ${eduTop.gpa || "未填写"}`
    : "未填写教育经历";

  return [
    {
      title: "读取个人目标画像",
      details: `目标国家/地区：${countries}；申请方向：${major}；入学时间：${personal.targetSemester || "未填写"}`,
    },
    {
      title: "解析学术背景强度",
      details: `教育经历 ${data.education.length} 段；核心背景：${eduSummary}`,
    },
    {
      title: "提取竞争力与亮点",
      details: `工作 ${data.workExperience.length} 段，项目 ${data.projects.length} 个，奖项 ${data.honors.length} 项，技能 ${data.skills.length} 项`,
    },
    {
      title: "校准申请偏好约束",
      details: `预算：${budget}；期望学制：${duration}；经费偏好：${personal.fundingIntent || "未填写"}`,
    },
    {
      title: "生成院校分档与项目清单",
      details: "综合冲刺 / 主申 / 保底梯度，输出匹配学校与项目建议",
    },
  ];
}

export default function MatchPage() {
  const router = useRouter();
  const workspaceVisited = useWorkspaceVisited();
  const {
    data: questionnaireData,
    isLoaded: isQuestionnaireLoaded,
    getCompletionStatus,
  } = useQuestionnaire();
  const { result, isLoaded: isResultLoaded, saveResult } = useMatchResult();

  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [addedPrograms, setAddedPrograms] = useState<string[]>([]);
  const [defaultPs, setDefaultPs] = useState<string | null>(null);
  const [matchSpotlightOpen, setMatchSpotlightOpen] = useState(false);
  const generationTimersRef = useRef<number[]>([]);

  const persistAddedPrograms = useCallback((ids: string[]) => {
    const normalized = uniqueProgramIds(ids);
    setAddedPrograms(normalized);
    localStorage.setItem(BUDDYUP_ADDED_PROGRAMS_KEY, JSON.stringify(normalized));
  }, []);

  const clearGenerationTimers = useCallback(() => {
    generationTimersRef.current.forEach((id) => window.clearTimeout(id));
    generationTimersRef.current = [];
  }, []);

  const runGeneration = useCallback((opts?: { instant?: boolean }) => {
    const instant = opts?.instant ?? false;
    clearGenerationTimers();
    const steps = buildAnalysisSteps(questionnaireData);
    const stepDuration = 850;
    setAnalysisSteps(steps);
    setActiveStepIndex(0);
    setIsGenerating(true);

    if (!instant) {
      steps.forEach((_, index) => {
        const timerId = window.setTimeout(() => {
          setActiveStepIndex(index);
        }, index * stepDuration);
        generationTimersRef.current.push(timerId);
      });
    }

    const finishTimerId = window.setTimeout(() => {
      const newResult = generateMatchResult(questionnaireData, { defaultPs });
      saveResult(newResult);
      setSelectedSchool(null);
      setIsGenerating(false);
    }, instant ? 80 : steps.length * stepDuration + 300);
    generationTimersRef.current.push(finishTimerId);
  }, [clearGenerationTimers, questionnaireData, saveResult, defaultPs]);

  useEffect(() => {
    if (isQuestionnaireLoaded && isResultLoaded && !result) {
      runGeneration();
    }
  }, [isQuestionnaireLoaded, isResultLoaded, result, runGeneration]);

  useEffect(() => {
    return () => {
      clearGenerationTimers();
    };
  }, [clearGenerationTimers]);

  useEffect(() => {
    const stored = localStorage.getItem(BUDDYUP_ADDED_PROGRAMS_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem(BUDDYUP_ADDED_PROGRAMS_KEY);
        return;
      }
      const normalized = uniqueProgramIds(parsed.filter((item): item is string => typeof item === "string"));
      setAddedPrograms(normalized);
      localStorage.setItem(BUDDYUP_ADDED_PROGRAMS_KEY, JSON.stringify(normalized));
    } catch {
      localStorage.removeItem(BUDDYUP_ADDED_PROGRAMS_KEY);
    }
  }, []);

  useEffect(() => {
    setDefaultPs(getDefaultPs());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!result || isGenerating) return;
    if (new URLSearchParams(window.location.search).get("replaySpotlight") === "1") return;
    try {
      if (window.localStorage.getItem(ONBOARDING_MATCH_SPOTLIGHT_V1)) return;
    } catch {
      return;
    }
    const id = window.requestAnimationFrame(() => setMatchSpotlightOpen(true));
    return () => window.cancelAnimationFrame(id);
  }, [result, isGenerating]);

  /** 全局「测试」菜单：`/match?replaySpotlight=1` 重播匹配页气泡引导 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!result || isGenerating) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("replaySpotlight") !== "1") return;
    try {
      window.localStorage.removeItem(ONBOARDING_MATCH_SPOTLIGHT_V1);
    } catch {
      /* ignore */
    }
    params.delete("replaySpotlight");
    const qs = params.toString();
    router.replace(`/match${qs ? `?${qs}` : ""}`, { scroll: false });
    const id = window.requestAnimationFrame(() => setMatchSpotlightOpen(true));
    return () => window.cancelAnimationFrame(id);
  }, [result, isGenerating, router]);

  const handleAddProgram = (programId: string) => {
    persistAddedPrograms([...addedPrograms, programId]);
  };

  const handleRemoveProgram = (programId: string) => {
    persistAddedPrograms(addedPrograms.filter((id) => id !== programId));
  };

  const handleToggleVisiblePrograms = () => {
    const ids = filteredPrograms.map((program) => program.id);
    if (ids.length === 0) return;
    const allIn = ids.every((id) => addedPrograms.includes(id));
    const updated = allIn
      ? addedPrograms.filter((id) => !ids.includes(id))
      : [...new Set([...addedPrograms, ...ids])];
    persistAddedPrograms(updated);
  };

  const handleRegenerate = () => {
    runGeneration();
  };

  const completionStatus = useMemo(
    () => getCompletionStatus(),
    [getCompletionStatus]
  );

  const filteredSchools = useMemo(() => {
    if (!result) return [];
    if (categoryFilter === "all") return result.schools;
    return result.schools.filter((s) => s.category === categoryFilter);
  }, [result, categoryFilter]);

  const categoryCounts = useMemo(() => {
    if (!result) return { all: 0, reach: 0, match: 0, safety: 0 };
    return {
      all: result.schools.length,
      reach: result.schools.filter((s) => s.category === "reach").length,
      match: result.schools.filter((s) => s.category === "match").length,
      safety: result.schools.filter((s) => s.category === "safety").length,
    };
  }, [result]);

  const filteredPrograms = useMemo(() => {
    if (!result) return [];
    let programs = result.programs;

    if (categoryFilter !== "all") {
      programs = programs.filter((p) => p.category === categoryFilter);
    }

    if (selectedSchool) {
      programs = programs.filter((p) => p.schoolId === selectedSchool.id);
    }

    return programs.sort((a, b) => {
      const schoolA = result.schools.find((s) => s.id === a.schoolId)?.ranking || 999;
      const schoolB = result.schools.find((s) => s.id === b.schoolId)?.ranking || 999;
      return schoolA - schoolB;
    });
  }, [result, categoryFilter, selectedSchool]);

  const matchSpotlightSteps = useMemo((): BubbleSpotlightStep[] => {
    const steps: BubbleSpotlightStep[] = [
      {
        targetSelector: '[data-tour="match-category-filter"]',
        title: "按分档筛选",
        description: "在冲刺、主申、保底之间切换，对齐当前选校策略；筛选会同步影响右侧项目列表。",
      },
      {
        targetSelector: '[data-tour="match-school-list"]',
        title: "院校列表",
        description: "点击学校可只看该校项目，也可与分档筛选组合，缩小浏览范围。",
      },
      {
        targetSelector: '[data-tour="match-program-toolbar"]',
        title: "匹配项目与批量勾选",
        description: "在此浏览推荐项目。需要批量操作时，可用「全部勾选」将当前筛选下的项目一次性加入清单。",
      },
    ];
    if (filteredPrograms.length > 0) {
      steps.push({
        targetSelector: '[data-tour="match-program-add"]',
        title: "加入项目清单",
        description: "在单张卡片上点击「+」添加到项目清单；已加入时同一位置可取消。加入后可在工作台管理文书与状态。",
      });
    }
    steps.push({
      targetSelector: '[data-tour="match-bottom-cta"]',
      title: "进入工作台",
      description:
        addedPrograms.length > 0
          ? "底部栏显示已选数量；点击箭头进入工作台，继续文书与申请进度。"
          : "至少加入一个项目后，底部会出现固定操作栏，可一键进入工作台。",
      allowMissingTarget: true,
      padding: 8,
    });
    return steps;
  }, [filteredPrograms.length, addedPrograms.length]);

  useEffect(() => {
    if (!selectedSchool) return;
    const stillVisible = filteredSchools.some((school) => school.id === selectedSchool.id);
    if (stillVisible) return;
    setSelectedSchool(null);
  }, [filteredSchools, selectedSchool]);

  if (!isQuestionnaireLoaded || !isResultLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <GuestBanner />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
          <div className="mb-8 h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          <h1 className="text-lg font-semibold tracking-tight text-foreground">正在分析并生成匹配方案</h1>
          <p className="mt-2 max-w-xl text-center text-sm text-muted-foreground leading-relaxed">
            系统将基于你在问卷中的填写信息，分步骤解析背景并生成院校与项目建议
          </p>
          <div className="mt-6 w-full max-w-2xl rounded-xl border border-border/80 bg-card/80 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>分析进度</span>
              <span className="tabular-nums">
                {Math.min(activeStepIndex + 1, Math.max(analysisSteps.length, 1))}/{Math.max(analysisSteps.length, 1)}
              </span>
            </div>
            <div className="space-y-2.5">
              {analysisSteps.map((step, index) => {
                const isDone = index < activeStepIndex;
                const isActive = index === activeStepIndex;
                return (
                  <div
                    key={step.title}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 transition-colors",
                      isActive
                        ? "border-foreground/40 bg-foreground/[0.06]"
                        : isDone
                          ? "border-border/70 bg-muted/25"
                          : "border-border/50 bg-background/70"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full text-ui-label font-medium",
                          isActive
                            ? "bg-foreground text-background"
                            : isDone
                              ? "bg-muted text-foreground"
                              : "bg-muted/70 text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-foreground">{step.title}</p>
                    </div>
                    <p className="mt-1.5 pl-7 text-xs leading-relaxed text-muted-foreground">{step.details}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => runGeneration({ instant: true })}
              >
                跳过动画
              </Button>
              <Button type="button" variant="ghost" size="sm" asChild>
                <Link
                  href={workspaceVisited ? WORKSPACE_BACKGROUND_HREF : "/questionnaire"}
                  aria-label={workspaceVisited ? "去我的背景" : "返回问卷"}
                >
                  {workspaceVisited ? "去我的背景" : "返回问卷"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <GuestBanner />

      <header className="sticky top-8 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            BuddyUp
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/20 p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:bg-background hover:text-foreground"
                    aria-label="重新匹配"
                    onClick={handleRegenerate}
                    disabled={!completionStatus.canGenerateMatch}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="text-xs">重新匹配</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">重新匹配</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={workspaceVisited ? WORKSPACE_BACKGROUND_HREF : "/questionnaire"}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label={workspaceVisited ? "去我的背景" : "返回问卷"}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span className="text-xs">{workspaceVisited ? "去我的背景" : "返回问卷"}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {workspaceVisited ? "工作台 · 我的背景" : "返回问卷"}
                </TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/workspace">
                  <Button size="sm" className="h-9 gap-1.5 px-3 shadow-sm" aria-label="工作台">
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-xs font-medium">工作台</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">工作台</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto max-w-6xl px-6 py-8",
          addedPrograms.length > 0 && "pb-24"
        )}
      >
        {!completionStatus.canGenerateMatch && (
          <div className="mb-4 rounded-lg border border-amber-300/70 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
            {workspaceVisited
              ? "当前为草稿匹配视图：请在工作台「我的背景」补齐个人信息与教育背景，再进行正式匹配。"
              : "当前为草稿匹配视图：请先在问卷补齐个人信息与教育背景，再进行正式匹配。"}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[minmax(288px,320px)_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-border/80 bg-card/95 p-2.5" data-tour="match-category-filter">
              <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-foreground/80">分档筛选</p>
              <div className="space-y-0.5">
                {CATEGORY_ITEMS.map(({ id, label, index }) => {
                  const active = categoryFilter === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(id);
                        setSelectedSchool(null);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors",
                        active
                          ? "border-foreground bg-background text-foreground"
                          : "border-transparent text-muted-foreground/80 hover:border-border/80 hover:bg-muted/40"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-7 text-xs tabular-nums",
                            active ? "text-foreground/80" : "text-muted-foreground/70"
                          )}
                        >
                          {index}
                        </span>
                        <span className={active ? "font-medium" : "font-normal"}>{label}</span>
                      </span>
                      <span
                        className={cn(
                          "tabular-nums text-xs",
                          active ? "text-foreground/75" : "text-muted-foreground"
                        )}
                      >
                        {categoryCounts[id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="hide-scrollbar rounded-xl border border-border/80 bg-card/95 p-3.5 lg:max-h-[min(65vh,560px)] lg:overflow-y-auto"
              data-tour="match-school-list"
            >
              <p className="mb-3 px-1 text-xs font-semibold tracking-wide text-foreground/80">院校</p>
              <div className="space-y-2">
                {filteredSchools.map((school) => {
                  const schoolPrograms = result?.programs.filter((p) => p.schoolId === school.id) ?? [];
                  const programCount = schoolPrograms.length;

                  return (
                    <SchoolCard
                      key={school.id}
                      school={school}
                      programCount={programCount}
                      onSelect={() => setSelectedSchool(school)}
                      isSelected={selectedSchool?.id === school.id}
                    />
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="min-h-[min(70vh,520px)] pr-1">
            <section className="overflow-hidden rounded-xl border border-border/80 bg-card/95">
              <div
                className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:py-6"
                data-tour="match-program-toolbar"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">匹配项目</h2>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                      {filteredPrograms.length}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    基于海量院校库为您精选以下项目
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-md border-chip-info-text/35 bg-chip-info-bg px-3 text-xs font-semibold text-chip-info-text shadow-sm hover:bg-chip-info-bg/85 hover:text-chip-info-text disabled:border-border/60 disabled:bg-muted/40 disabled:font-medium disabled:text-muted-foreground"
                  disabled={filteredPrograms.length === 0}
                  onClick={handleToggleVisiblePrograms}
                >
                  {filteredPrograms.every((program) => addedPrograms.includes(program.id))
                    ? "取消全选"
                    : "全部勾选"}
                </Button>
              </div>

              {selectedSchool && (
                <>
                  <SchoolNotionCover school={selectedSchool} />
                  {(selectedSchool.campusStyle ||
                    selectedSchool.locationAndSetting ||
                    selectedSchool.studentLife) && (
                    <div className="border-b border-border/80 bg-muted/[0.18] px-6 py-5 sm:px-8">
                      <p className="mb-3 text-sm font-semibold text-foreground">院校介绍</p>
                      <SchoolRichInfo school={selectedSchool} />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-4 p-6 sm:p-8">
                {filteredPrograms.map((program) => {
                  const school = result?.schools.find((s) => s.id === program.schoolId);
                  if (!school) return null;

                  return (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      school={school}
                      showSchoolInHeader={!selectedSchool}
                      isAdded={addedPrograms.includes(program.id)}
                      onAdd={() => handleAddProgram(program.id)}
                      onRemove={() => handleRemoveProgram(program.id)}
                      tourAddTarget={program.id === filteredPrograms[0]?.id}
                    />
                  );
                })}

                {filteredPrograms.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/[0.18] py-12 text-center text-sm text-muted-foreground">
                    当前筛选下暂无项目，试试切换分档或学校
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">结果基于本地问卷数据生成</p>
      </main>

      {addedPrograms.length > 0 && (
        <div
          className="sticky bottom-0 z-30 border-t border-border bg-background/85 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70"
          data-tour="match-bottom-cta"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
            <p className="text-sm tabular-nums text-muted-foreground">
              已选 <span className="font-medium text-foreground">{addedPrograms.length}</span>
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/workspace">
                  <Button size="icon" className="h-10 w-10 shrink-0" aria-label="去工作台">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">去工作台</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      <BubbleSpotlightTour
        open={matchSpotlightOpen}
        onOpenChange={setMatchSpotlightOpen}
        steps={matchSpotlightSteps}
        finishStorageKey={ONBOARDING_MATCH_SPOTLIGHT_V1}
        zIndex={110}
      />
    </div>
  );
}
