"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sparkles,
  Search,
  MoreVertical,
  Trash2,
  Calendar,
  Clock,
  GraduationCap,
  FileText,
  LayoutGrid,
  ListChecks,
  Menu,
  PenLine,
  FileStack,
  Globe2,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { SchoolRichInfo } from "@/components/match/school-rich-info";
import { SchoolNotionCover } from "@/components/match/school-notion-cover";
import { SchoolLogoMark } from "@/components/match/school-logo-mark";
import { WorkspaceApplicationsMap } from "@/components/workspace/workspace-applications-map";
import { WorkspaceBuddy } from "@/components/workspace/workspace-buddy";
import { useMatchResult, useQuestionnaire } from "@/hooks/use-questionnaire";
import type { Program, School } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_DRAFT_LABELS,
  DOCUMENT_DRAFT_ORDER,
  getDraft,
  getProgramIdsWithSavedDrafts,
  listProgramDraftSummaries,
  type DocumentDraftKind,
} from "@/lib/document-drafts";

interface ApplicationItem {
  program: Program;
  school: School;
  status: "todo" | "in-progress" | "submitted" | "accepted" | "rejected";
  notes?: string;
}

const statusConfig = {
  todo: { label: "待申请", color: "bg-muted text-foreground" },
  "in-progress": { label: "准备中", color: "bg-muted text-foreground" },
  submitted: { label: "已提交", color: "bg-muted text-foreground" },
  accepted: { label: "已录取", color: "bg-muted text-foreground" },
  rejected: { label: "已拒绝", color: "bg-muted text-foreground" },
};

type SchoolDraftSheetItem = {
  programId: string;
  programNameEn: string;
  kind: DocumentDraftKind;
  preview: string;
  updatedAt: string;
};

function formatDraftUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function WorkspacePage() {
  const { result } = useMatchResult();
  const { data: questionnaireData, isLoaded: questionnaireLoaded } = useQuestionnaire();
  const [addedProgramIds, setAddedProgramIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<Record<string, ApplicationItem["status"]>>({});
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [draftRefresh, setDraftRefresh] = useState(0);
  /** 避免在首屏 render 中读 localStorage，与 SSR 空草稿树一致，消除 hydration mismatch */
  const [draftStorageReady, setDraftStorageReady] = useState(false);
  const [showAllSchoolDrafts, setShowAllSchoolDrafts] = useState(false);
  const [usageGuideOpen, setUsageGuideOpen] = useState(false);

  useEffect(() => {
    setDraftStorageReady(true);
    const storedPrograms = localStorage.getItem("edumatch_added_programs");
    if (storedPrograms) {
      setAddedProgramIds(JSON.parse(storedPrograms));
    }

    const storedStatus = localStorage.getItem("edumatch_application_status");
    if (storedStatus) {
      setApplications(JSON.parse(storedStatus));
    }
  }, []);

  useEffect(() => {
    setShowAllSchoolDrafts(false);
  }, [selectedSchoolId]);

  useEffect(() => {
    const bump = () => setDraftRefresh((n) => n + 1);
    window.addEventListener("focus", bump);
    document.addEventListener("visibilitychange", bump);
    return () => {
      window.removeEventListener("focus", bump);
      document.removeEventListener("visibilitychange", bump);
    };
  }, []);

  const programIdsWithDrafts = useMemo(() => {
    if (!draftStorageReady) return new Set<string>();
    void draftRefresh;
    return getProgramIdsWithSavedDrafts();
  }, [draftStorageReady, draftRefresh, addedProgramIds.join(",")]);

  const draftSummaries = useMemo(() => {
    if (!draftStorageReady) return [];
    void draftRefresh;
    return listProgramDraftSummaries();
  }, [draftStorageReady, draftRefresh, addedProgramIds.length]);

  const labelForDraftProgram = (programId: string) => {
    if (!result) return programId;
    const program = result.programs.find((p) => p.id === programId);
    if (!program) return `草稿 · ${programId.slice(0, 8)}…`;
    const school = result.schools.find((s) => s.id === program.schoolId);
    return school ? `${school.name} · ${program.nameEn}` : program.nameEn;
  };

  const abbrevSchool = (school: School) => {
    const en = school.nameEn.trim();
    if (en.length <= 12) return en;
    const stop = new Set(["University", "College", "of", "The", "in", "and", "at"]);
    const parts = en.split(/\s+/).filter((w) => w && !stop.has(w));
    if (parts.length === 1) {
      const w = parts[0];
      return w.length <= 12 ? w : `${w.slice(0, 10)}…`;
    }
    if (parts.length >= 2) {
      const initials = parts
        .slice(0, 4)
        .map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w[0]))
        .join("")
        .toUpperCase();
      if (initials.length >= 2 && initials.length <= 8) return initials;
    }
    return `${en.slice(0, 10)}…`;
  };

  const abbrevProgramLine = (program: Program) => {
    const stripped = program.nameEn
      .replace(/^(Master|MS|MSc|MPhil|MBA|MA)\s+(of|in)\s+/i, "")
      .trim();
    const core = stripped.length > 0 ? stripped : program.nameEn;
    const tail = core.length > 18 ? `${core.slice(0, 16)}…` : core;
    return `${program.degree} ${tail}`.trim();
  };

  const abbrevLabelForDraftProgram = (programId: string) => {
    if (!result) return programId.slice(0, 10);
    const program = result.programs.find((p) => p.id === programId);
    if (!program) return `草稿 ${programId.slice(0, 6)}…`;
    const school = result.schools.find((s) => s.id === program.schoolId);
    if (!school) return abbrevProgramLine(program);
    return `${abbrevSchool(school)} · ${abbrevProgramLine(program)}`;
  };

  const addedPrograms = useMemo(() => {
    if (!result) return [];
    return addedProgramIds
      .map((id) => {
        const program = result.programs.find((p) => p.id === id);
        const school = result.schools.find((s) => s.id === program?.schoolId);
        if (!program || !school) return null;
        return { program, school };
      })
      .filter(Boolean) as { program: Program; school: School }[];
  }, [result, addedProgramIds]);

  const searchFiltered = useMemo(() => {
    if (!searchQuery) return addedPrograms;
    const query = searchQuery.toLowerCase();
    return addedPrograms.filter(
      ({ program, school }) =>
        program.name.toLowerCase().includes(query) ||
        program.nameEn.toLowerCase().includes(query) ||
        school.name.toLowerCase().includes(query) ||
        school.nameEn.toLowerCase().includes(query)
    );
  }, [addedPrograms, searchQuery]);

  const displayPrograms = useMemo(() => {
    if (!selectedSchoolId) return searchFiltered;
    return searchFiltered.filter(({ school }) => school.id === selectedSchoolId);
  }, [searchFiltered, selectedSchoolId]);

  const groupedBySchool = useMemo(() => {
    const groups: Record<string, { school: School; programs: Program[] }> = {};
    displayPrograms.forEach(({ program, school }) => {
      if (!groups[school.id]) {
        groups[school.id] = { school, programs: [] };
      }
      groups[school.id].programs.push(program);
    });
    return Object.values(groups);
  }, [displayPrograms]);

  /** 「全部申请」地图：按当前列表（含搜索筛选）聚合同校坐标 */
  const workspaceMapPins = useMemo(() => {
    const m = new Map<string, { school: School; count: number }>();
    for (const { school } of displayPrograms) {
      if (school.lat == null || school.lng == null) continue;
      const cur = m.get(school.id);
      if (cur) cur.count += 1;
      else m.set(school.id, { school, count: 1 });
    }
    return Array.from(m.values()).map(({ school, count }) => ({
      schoolId: school.id,
      name: school.name,
      nameEn: school.nameEn,
      city: school.city,
      country: school.country,
      lat: school.lat!,
      lng: school.lng!,
      programCount: count,
      logo: school.logo,
    }));
  }, [displayPrograms]);

  const schoolsInWorkspace = useMemo(() => {
    const map = new Map<string, School>();
    addedPrograms.forEach(({ school }) => map.set(school.id, school));
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  }, [addedPrograms]);

  const selectedSchool = useMemo(() => {
    if (!selectedSchoolId) return null;
    return schoolsInWorkspace.find((s) => s.id === selectedSchoolId) ?? null;
  }, [selectedSchoolId, schoolsInWorkspace]);

  const schoolDraftSheets = useMemo((): SchoolDraftSheetItem[] => {
    void draftRefresh;
    if (!selectedSchoolId) return [];
    if (!draftStorageReady) return [];
    const sheets: SchoolDraftSheetItem[] = [];
    for (const { program, school } of addedPrograms) {
      if (school.id !== selectedSchoolId) continue;
      for (const kind of DOCUMENT_DRAFT_ORDER) {
        const d = getDraft(program.id, kind);
        const text = d?.content?.trim();
        if (!d || !text) continue;
        const collapsed = text.replace(/\s+/g, " ");
        const truncated = collapsed.length > 320;
        const preview = collapsed.slice(0, 320);
        sheets.push({
          programId: program.id,
          programNameEn: program.nameEn,
          kind,
          preview: truncated ? `${preview}…` : preview,
          updatedAt: d.updatedAt,
        });
      }
    }
    return sheets.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [selectedSchoolId, addedPrograms, draftRefresh, draftStorageReady]);

  const schoolDraftSheetsLimit = 6;
  const visibleSchoolDraftSheets = useMemo(() => {
    if (showAllSchoolDrafts || schoolDraftSheets.length <= schoolDraftSheetsLimit) {
      return schoolDraftSheets;
    }
    return schoolDraftSheets.slice(0, schoolDraftSheetsLimit);
  }, [schoolDraftSheets, showAllSchoolDrafts]);
  const schoolDraftSheetsNeedExpand = schoolDraftSheets.length > schoolDraftSheetsLimit;

  /** 与当前主列表一致（含搜索筛选）的仪表盘数字 */
  const dashboardStats = useMemo(() => {
    const statusCounts = {
      todo: 0,
      "in-progress": 0,
      submitted: 0,
      accepted: 0,
      rejected: 0,
    };
    const schoolIds = new Set<string>();
    for (const { program, school } of displayPrograms) {
      schoolIds.add(school.id);
      const status = applications[program.id] || "todo";
      statusCounts[status]++;
    }
    return {
      programs: displayPrograms.length,
      schools: schoolIds.size,
      todo: statusCounts.todo,
      active: statusCounts["in-progress"] + statusCounts.submitted,
      outcome: statusCounts.accepted + statusCounts.rejected,
    };
  }, [displayPrograms, applications]);

  const backgroundMaterialCount = questionnaireData.files.length;
  const shouldPromptMoreBackgroundMaterials =
    questionnaireLoaded && backgroundMaterialCount < 5;

  const updateStatus = (programId: string, status: ApplicationItem["status"]) => {
    const updated = { ...applications, [programId]: status };
    setApplications(updated);
    localStorage.setItem("edumatch_application_status", JSON.stringify(updated));
  };

  const removeProgram = (programId: string) => {
    const updated = addedProgramIds.filter((id) => id !== programId);
    setAddedProgramIds(updated);
    localStorage.setItem("edumatch_added_programs", JSON.stringify(updated));
  };

  const selectSchool = (id: string | null) => {
    setSelectedSchoolId(id);
  };

  const sidebarBody = (opts: { onPick?: () => void }) => (
    <>
      <div className="px-3 pb-4">
        <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">浏览</p>
        <nav className="space-y-0.5" aria-label="浏览">
          <Link
            href="/questionnaire"
            onClick={() => opts.onPick?.()}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <FileText className="h-4 w-4 shrink-0 opacity-70" />
            <span className="flex-1 truncate">我的背景</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setSelectedSchoolId(null);
              opts.onPick?.();
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              selectedSchoolId == null
                ? "bg-muted/80 text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4 shrink-0 opacity-70" />
            <span className="flex-1 truncate">全部申请</span>
            {addedPrograms.length > 0 && (
              <span className="text-xs text-muted-foreground">{addedPrograms.length}</span>
            )}
          </button>
        </nav>
      </div>

      <div className="px-3 pb-4">
        <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">学校</p>
        {schoolsInWorkspace.length === 0 ? (
          <p className="px-2 text-xs text-muted-foreground">请先在选校结果页勾选项目，列表会自动同步</p>
        ) : (
          <ScrollArea className="h-[min(40vh,280px)] pr-2">
            <div className="space-y-0.5">
              {schoolsInWorkspace.map((school) => {
                const active = selectedSchoolId === school.id;
                const count = addedPrograms.filter((p) => p.school.id === school.id).length;
                return (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => {
                      selectSchool(active ? null : school.id);
                      opts.onPick?.();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      active
                        ? "bg-muted/80 text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <SchoolLogoMark school={school} size="sidebar" rounded="md" />
                    <span className="min-w-0 flex-1 truncate">{school.name}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="px-3 pb-4">
        <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">我的文书</p>
        {draftSummaries.length === 0 ? (
          <p className="px-2 text-xs leading-relaxed text-muted-foreground">
            在项目中点击笔形图标创建文书后，草稿会出现在这里。
          </p>
        ) : (
          <ScrollArea className="h-[min(36vh,220px)] pr-2">
            <div className="space-y-0.5">
              {draftSummaries.map((d) => (
                <Tooltip key={d.programId}>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/workspace/write/${d.programId}`}
                      onClick={() => opts.onPick?.()}
                      className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      aria-label={labelForDraftProgram(d.programId)}
                      title={labelForDraftProgram(d.programId)}
                    >
                      <PenLine className="h-4 w-4 shrink-0 opacity-70" />
                      <span className="min-w-0 flex-1 truncate text-xs leading-snug text-foreground/90">
                        {abbrevLabelForDraftProgram(d.programId)}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[min(280px,calc(100vw-3rem))]">
                    <p className="font-medium">{labelForDraftProgram(d.programId)}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

    </>
  );

  const sidebarFooter = (opts: { onPick?: () => void }) => (
    <div className="border-t border-border/60 bg-muted/10 px-3 py-3">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            setUsageGuideOpen(true);
            opts.onPick?.();
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <span>使用说明</span>
        </button>
        <a
          href="mailto:?subject=EduMatch%20%E7%94%A8%E6%88%B7%E5%8F%8D%E9%A6%88"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          onClick={() => opts.onPick?.()}
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <span>用户反馈</span>
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <GuestBanner />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar — Notion-like */}
        <aside className="hidden min-h-0 w-[260px] shrink-0 flex-col border-r border-border bg-muted/20 md:flex">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">EduMatch</p>
                <p className="truncate text-xs text-muted-foreground">申请工作台</p>
              </div>
            </Link>
          </div>

          <div className="shrink-0 border-b border-border/60 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索…"
                className="h-9 border-border/80 bg-background/80 pl-8 text-sm shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
            <div className="py-3">{sidebarBody({})}</div>
            {sidebarFooter({})}
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="打开侧栏"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">工作台</p>
              <p className="truncate text-xs text-muted-foreground">
                {selectedSchool
                  ? `${selectedSchool.name} · ${displayPrograms.length} 项`
                  : "全部申请"}
              </p>
            </div>
            <Link href="/" className="shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            </Link>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:py-8">
            <div className={cn("mx-auto", selectedSchool ? "max-w-4xl" : "max-w-6xl")}>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {selectedSchool ? selectedSchool.nameEn : "全部申请"}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedSchool ? (
                        <>
                          {selectedSchool.name} · {displayPrograms.length} 个项目
                          {searchQuery ? ` · 已按搜索筛选` : ""}
                        </>
                      ) : (
                        <>
                          申请概览 · {dashboardStats.programs} 个项目 · {dashboardStats.schools} 所院校
                          {searchQuery ? ` · 已按搜索筛选` : ""}
                        </>
                      )}
                    </p>
                  </div>
                  {!selectedSchool ? <WorkspaceBuddy className="pt-0.5" /> : null}
                </div>

                <div className="h-9 w-9 shrink-0" aria-hidden />
              </div>

              {!selectedSchool && (
                <section className="mb-8 space-y-5" aria-label="申请概览仪表盘">
                  {shouldPromptMoreBackgroundMaterials ? (
                    <Card className="gap-0 border-amber-300/70 bg-amber-50/70 py-0 shadow-none dark:border-amber-900/60 dark:bg-amber-950/20">
                      <CardContent className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                          <p className="text-sm text-amber-900 dark:text-amber-200">
                            当前背景材料仅 {backgroundMaterialCount} 条，建议至少补充到 5 条，以便完善匹配与文书素材。
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="h-8 shrink-0" asChild>
                          <Link href="/questionnaire">去我的背景补充</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}

                  {addedPrograms.length > 0 ? (
                    <section className="space-y-3" aria-label="概览指标">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <h2 className="text-sm font-medium text-foreground">概览指标</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-border/70 bg-muted/[0.16] px-4 py-3.5">
                          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">院校</span>
                          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                            {dashboardStats.schools}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-muted/[0.16] px-4 py-3.5">
                          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">待申请</span>
                          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                            {dashboardStats.todo}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-muted/[0.16] px-4 py-3.5">
                          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
                            准备 / 已递交
                          </span>
                          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                            {dashboardStats.active}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-muted/[0.16] px-4 py-3.5">
                          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
                            已有结果
                          </span>
                          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                            {dashboardStats.outcome}
                          </p>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  <div className="grid gap-6 border-t border-border/60 pt-5 lg:grid-cols-12 lg:items-start">
                    <section
                      className={cn("space-y-3.5", workspaceMapPins.length > 0 ? "lg:col-span-5" : "lg:col-span-12")}
                    >
                      <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <h2 className="text-sm font-medium text-foreground">快捷操作</h2>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button
                          variant="outline"
                          className="h-16 justify-start gap-3 rounded-lg border-border/70 bg-background/70 px-4 text-sm font-medium shadow-none transition-colors hover:bg-muted/35"
                          asChild
                        >
                          <Link href="/match">
                            <ListChecks className="h-4.5 w-4.5 opacity-80" aria-hidden />
                            选校清单
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-16 justify-start gap-3 rounded-lg border-border/70 bg-background/70 px-4 text-sm font-medium shadow-none transition-colors hover:bg-muted/35"
                          asChild
                        >
                          <Link href="/questionnaire">
                            <FileText className="h-4.5 w-4.5 opacity-80" aria-hidden />
                            我的背景
                          </Link>
                        </Button>
                      </div>
                    </section>

                    {workspaceMapPins.length > 0 ? (
                      <section className="space-y-3.5 lg:col-span-7">
                        <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
                          <Globe2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                          <h2 className="text-sm font-medium text-foreground">地图分布</h2>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/[0.08] px-3 py-3">
                          <WorkspaceApplicationsMap
                            pins={workspaceMapPins}
                            onSelectSchool={(id) => selectSchool(id)}
                            className="mx-auto max-w-[280px] shadow-none"
                          />
                        </div>
                      </section>
                    ) : null}
                  </div>
                </section>
              )}

              {selectedSchool && (
                <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
                  <SchoolNotionCover school={selectedSchool} />
                  {(selectedSchool.campusStyle ||
                    selectedSchool.locationAndSetting ||
                    selectedSchool.studentLife) && (
                    <div className="border-t border-border/80 px-4 py-4 sm:px-5 sm:py-5">
                      <SchoolRichInfo school={selectedSchool} className="text-sm" />
                    </div>
                  )}
                </div>
              )}

              {selectedSchool && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <h2 className="text-sm font-medium text-foreground">已保存文书</h2>
                  </div>
                  {schoolDraftSheets.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
                      暂无已保存内容。在下方项目中点击笔形图标起草后，会以预览卡片显示在这里。
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3">
                        {visibleSchoolDraftSheets.map((sheet) => (
                          <Link
                            key={`${sheet.programId}-${sheet.kind}`}
                            href={`/workspace/write/${sheet.programId}`}
                            className={cn(
                              "group mx-auto block w-full max-w-[280px] outline-none sm:mx-0 sm:max-w-none",
                              "focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            )}
                          >
                            <article
                              className={cn(
                                "relative flex aspect-[210/297] w-full flex-col overflow-hidden rounded-2xl",
                                "border border-border/50 bg-card/80 text-card-foreground backdrop-blur-[2px]",
                                "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
                                "transition-[transform,box-shadow,border-color] duration-200 ease-out",
                                "group-hover:-translate-y-0.5 group-hover:border-border/70",
                                "group-hover:shadow-[0_4px_24px_-4px_rgba(15,23,42,0.07),0_2px_8px_-2px_rgba(15,23,42,0.04)]",
                                "dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
                                "dark:group-hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.35)]"
                              )}
                            >
                              <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-[7%] top-[8%] h-px bg-border/50"
                              />
                              <div className="flex min-h-0 flex-1 flex-col px-[9%] pb-[8%] pt-[12%]">
                                <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2">
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold tracking-wide text-foreground/90">
                                      {DOCUMENT_DRAFT_LABELS[sheet.kind]}
                                    </p>
                                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                      {sheet.programNameEn}
                                    </p>
                                  </div>
                                  <PenLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                                <div className="min-h-0 flex-1 overflow-hidden pt-3">
                                  <p className="line-clamp-[14] whitespace-pre-wrap break-words font-serif text-[11px] leading-[1.65] text-foreground/85">
                                    {sheet.preview}
                                  </p>
                                </div>
                                <p className="mt-auto border-t border-border/40 pt-2 text-[10px] tabular-nums text-muted-foreground">
                                  更新 {formatDraftUpdated(sheet.updatedAt)}
                                </p>
                              </div>
                            </article>
                          </Link>
                        ))}
                      </div>
                      {schoolDraftSheetsNeedExpand && !showAllSchoolDrafts && (
                        <div className="flex justify-center pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setShowAllSchoolDrafts(true)}
                          >
                            查看全部文书
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!selectedSchool && addedPrograms.length > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <h2 className="text-sm font-medium text-foreground">申请列表</h2>
                </div>
              )}

              {addedPrograms.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <GraduationCap className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
                  <h2 className="mb-2 text-lg font-semibold text-foreground">还没有添加申请项目</h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                从匹配结果中加入项目后，会出现在左侧栏与列表中；每个项目可点击笔形图标按模板起草文书。
              </p>
                  <Link href="/match">
                    <Button>
                      <Sparkles className="mr-2 h-4 w-4" />
                      查看匹配结果
                    </Button>
                  </Link>
                </div>
              ) : displayPrograms.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  当前筛选下没有项目，试试清空搜索或切换左侧视图。
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedBySchool.map(({ school, programs }) => {
                    const hideSchoolHeader = selectedSchoolId === school.id;
                    return (
                    <div key={school.id} className="overflow-hidden rounded-lg border border-border bg-card">
                      {!hideSchoolHeader && (
                        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-3">
                          <SchoolLogoMark school={school} size="row" rounded="md" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-foreground">{school.name}</h3>
                            <p className="text-xs text-muted-foreground">{school.nameEn}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{programs.length}</span>
                        </div>
                      )}

                      <div className="divide-y divide-border">
                        {programs.map((program) => {
                          const status = applications[program.id] || "todo";
                          const statusInfo = statusConfig[status];

                          return (
                            <div
                              key={program.id}
                              className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/15 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <h4 className="font-medium text-foreground">{program.nameEn}</h4>
                                  <Badge variant="outline" className={cn("font-normal", statusInfo.color)}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                  <span>{program.degree}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {program.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {program.deadline}
                                  </span>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" className="h-9 w-9" asChild>
                                      <Link
                                        href={`/workspace/write/${program.id}`}
                                        aria-label="写文书"
                                      >
                                        <PenLine className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">写文书</TooltipContent>
                                </Tooltip>
                                {programIdsWithDrafts.has(program.id) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex h-9 w-9 cursor-default items-center justify-center text-muted-foreground">
                                        <FileStack className="h-4 w-4 opacity-80" aria-hidden />
                                        <span className="sr-only">已保存草稿</span>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">已保存草稿</TooltipContent>
                                  </Tooltip>
                                )}
                                <DropdownMenu>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-9 w-9"
                                          aria-label="申请状态"
                                        >
                                          <ListChecks className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">申请状态</TooltipContent>
                                  </Tooltip>
                                  <DropdownMenuContent align="end">
                                    {Object.entries(statusConfig).map(([key, value]) => (
                                      <DropdownMenuItem
                                        key={key}
                                        onClick={() => updateStatus(program.id, key as ApplicationItem["status"])}
                                      >
                                        {value.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="更多">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">更多</TooltipContent>
                                  </Tooltip>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => removeProgram(program.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      移除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={usageGuideOpen} onOpenChange={setUsageGuideOpen}>
        <DialogContent className="flex max-h-[min(88vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-4 pr-12 text-left">
            <DialogTitle className="text-lg">EduMatch 使用说明</DialogTitle>
            <p className="text-sm font-normal text-muted-foreground">
              产品定位、数据来源、团队背景与工作台操作
            </p>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1 max-h-[min(58vh,480px)] sm:max-h-[min(62vh,520px)]">
            <div className="space-y-5 px-6 py-4 pr-4 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                  产品定位
                </h3>
                <p>
                  EduMatch 是<strong className="font-medium text-foreground">演示型</strong>
                  留学匹配产品，把「问卷 → 匹配结果 → 申请工作台 → 文书草稿」串成可走完的闭环，便于展示流程与做用户访谈；当前版本<strong className="font-medium text-foreground">不替代</strong>
                  院校官方招生系统，也不提供真实录取预测。
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                  数据来源
                </h3>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    <span className="font-medium text-foreground">院校与项目</span>：内置演示数据集（约 8
                    所院校、12–15 个项目），含排名、学制、学费、简介、课程说明等字段；与问卷字段由
                    <strong className="font-medium text-foreground">本地规则</strong>
                    组合生成匹配列表与「匹配说明」文案，非实时同步任一官方数据库。
                  </li>
                  <li>
                    <span className="font-medium text-foreground">地图</span>：底图使用
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
                    >
                      OpenStreetMap
                    </a>
                    公开瓦片；各校坐标为 WGS84
                    <strong className="font-medium text-foreground">主校区近似点</strong>
                    ，仅作分布示意，不表示精确校园范围。
                  </li>
                  <li>
                    <span className="font-medium text-foreground">学校介绍文案</span>：工作台单校视图中的校园风格、城市与生活描述等，为产品侧编写的
                    <strong className="font-medium text-foreground">说明性内容</strong>
                    ，用于 Demo 信息层级，不代表该校官方表述。
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                  数据与隐私
                </h3>
                <p>
                  问卷、匹配结果、申请单、申请状态与文书草稿均保存在本机浏览器
                  <strong className="font-medium text-foreground">localStorage</strong>
                  ，不上传服务器、不登录账号；清除站点数据或更换设备后内容不会跟随。请勿将本 Demo
                  当作云端备份工具。
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                  团队与背景
                </h3>
                <p>
                  本项目在 <strong className="font-medium text-foreground">BuddyUp</strong>{" "}
                  产品脉络下协作推进：由产品与工程同学负责交互、前端实现与演示数据编排，并参考服务设计、认知负荷与长表单体验等常见设计原则做迭代（内部设计笔记见仓库中的理论基础整理）。当前阶段聚焦
                  <strong className="font-medium text-foreground">可演示、可讨论</strong>
                  的端到端体验，而非商业录取服务。
                </p>
                <p className="mt-2 text-xs text-muted-foreground/90">
                  选校与投递决策请以目标院校官网、院系说明与正规顾问渠道为准；本产品中任何匹配排序与文案均不构成申请建议或承诺。
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                  工作台操作
                </h3>
                <ul className="list-inside list-disc space-y-2">
                  <li>左侧「全部申请」与学校列表可切换视图；顶部搜索可过滤项目。</li>
                  <li>「全部申请」主区为仪表盘：指标卡片、快捷操作与地图；列表在下方。</li>
                  <li>列表中可改申请状态；「写文书」进入草稿编辑，草稿保存在本机浏览器。</li>
                  <li>侧栏「我的文书」汇总有内容的草稿；返回本页或切换窗口后会自动刷新状态。</li>
                </ul>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="flex min-h-0 w-[280px] flex-col gap-0 p-0 sm:max-w-[280px]">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setMobileSidebarOpen(false)}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">EduMatch</p>
                <p className="truncate text-xs text-muted-foreground">申请工作台</p>
              </div>
            </Link>
          </div>
          <div className="shrink-0 border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索…"
                className="h-9 border-border/80 bg-background/80 pl-8 text-sm shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
            <div className="py-3">{sidebarBody({ onPick: () => setMobileSidebarOpen(false) })}</div>
            {sidebarFooter({ onPick: () => setMobileSidebarOpen(false) })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
