"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, RefreshCw, ChevronRight, LayoutGrid } from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { SchoolCard } from "@/components/match/school-card";
import { SchoolRichInfo } from "@/components/match/school-rich-info";
import { SchoolNotionCover } from "@/components/match/school-notion-cover";
import { ProgramCard } from "@/components/match/program-card";
import { useQuestionnaire, useMatchResult } from "@/hooks/use-questionnaire";
import { generateMatchResult } from "@/lib/mock-match";
import type { QuestionnaireData, School } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const generationTimersRef = useRef<number[]>([]);

  const persistAddedPrograms = useCallback((ids: string[]) => {
    const normalized = uniqueProgramIds(ids);
    setAddedPrograms(normalized);
    localStorage.setItem("edumatch_added_programs", JSON.stringify(normalized));
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
      const newResult = generateMatchResult(questionnaireData);
      saveResult(newResult);
      setSelectedSchool(null);
      setIsGenerating(false);
    }, instant ? 80 : steps.length * stepDuration + 300);
    generationTimersRef.current.push(finishTimerId);
  }, [clearGenerationTimers, questionnaireData, saveResult]);

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
    const stored = localStorage.getItem("edumatch_added_programs");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        localStorage.removeItem("edumatch_added_programs");
        return;
      }
      const normalized = uniqueProgramIds(parsed.filter((item): item is string => typeof item === "string"));
      setAddedPrograms(normalized);
      localStorage.setItem("edumatch_added_programs", JSON.stringify(normalized));
    } catch {
      localStorage.removeItem("edumatch_added_programs");
    }
  }, []);

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
                <Link href="/questionnaire">返回问卷</Link>
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
            EduMatch
          </Link>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 px-3"
                  aria-label="重新匹配"
                  onClick={handleRegenerate}
                  disabled={!completionStatus.canGenerateMatch}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-xs">重新匹配</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">重新匹配</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/questionnaire">
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3" aria-label="返回问卷">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-xs">返回问卷</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">返回问卷</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/workspace">
                  <Button size="sm" className="h-9 gap-1.5 px-3" aria-label="工作台">
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-xs">工作台</span>
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
            当前为草稿匹配视图：请先在问卷补齐个人信息与教育背景，再进行正式匹配。
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[minmax(288px,320px)_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-border/80 bg-card/95 p-2.5">
              <p className="mb-1.5 px-2 text-xs text-muted-foreground">分档筛选</p>
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

            <div className="hide-scrollbar rounded-xl border border-border/80 bg-card/95 p-3.5 lg:max-h-[min(65vh,560px)] lg:overflow-y-auto">
              <p className="mb-3 px-1 text-xs font-medium text-muted-foreground">院校</p>
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
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 sm:px-8 sm:py-5">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">匹配项目</h2>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                    {filteredPrograms.length}
                  </span>
                  {selectedSchool && (
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      当前院校：{selectedSchool.nameEn}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 shrink-0 rounded-md border-chip-info-text/35 bg-chip-info-bg px-2.5 text-xs font-medium text-chip-info-text shadow-none hover:bg-chip-info-bg/85 hover:text-chip-info-text disabled:border-border/60 disabled:bg-muted/40 disabled:text-muted-foreground"
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
                      <p className="mb-3 text-xs font-medium text-muted-foreground">院校介绍</p>
                      <SchoolRichInfo school={selectedSchool} />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-3 p-6 sm:p-8">
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
        <div className="sticky bottom-0 z-30 border-t border-border bg-background/85 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
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
    </div>
  );
}
