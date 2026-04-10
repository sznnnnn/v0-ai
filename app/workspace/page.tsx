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
  GraduationCap,
  FileText,
  LayoutGrid,
  ListChecks,
  Menu,
  PenLine,
  FileStack,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  AlertTriangle,
  File,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Check,
  User,
  Briefcase,
  FolderGit2,
} from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { SchoolLogoMark } from "@/components/match/school-logo-mark";
import { SchoolRichInfo } from "@/components/match/school-rich-info";
import { ProgramCard } from "@/components/match/program-card";
import { WorkspaceBuddy } from "@/components/workspace/workspace-buddy";
import { useMatchResult, useQuestionnaire } from "@/hooks/use-questionnaire";
import type { Program, QuestionnaireData, School } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_DRAFT_LABELS,
  DOCUMENT_DRAFT_ORDER,
  getDraft,
  getProgramIdsWithSavedDrafts,
  listProgramDraftSummaries,
  type DocumentDraftKind,
} from "@/lib/document-drafts";
import { getProgramEnrichment } from "@/lib/program-enrichment";

interface ApplicationItem {
  program: Program;
  school: School;
  status: "todo" | "in-progress" | "submitted" | "accepted" | "rejected";
  notes?: string;
}

const statusConfig = {
  todo: {
    label: "待申请",
    color: "border-transparent bg-[#F5E8FF] text-[#722ED1]",
  },
  "in-progress": {
    label: "准备中",
    color: "border-transparent bg-[#FFF7E8] text-[#FF7D00]",
  },
  submitted: {
    label: "已提交",
    color: "border-transparent bg-chip-info-bg text-chip-info-text",
  },
  accepted: {
    label: "已录取",
    color: "border-transparent bg-[#E8FFEA] text-[#00B42A]",
  },
  rejected: {
    label: "已拒绝",
    color: "border-transparent bg-[#FFFCE8] text-[#F7BA1E]",
  },
};

const notionTagPalette = [
  "border-transparent bg-chip-info-bg text-chip-info-text", // Blue
  "border-transparent bg-[#FFFCE8] text-[#F7BA1E]", // Yellow
  "border-transparent bg-[#FFF7E8] text-[#FF7D00]", // Orange
  "border-transparent bg-[#E8FFEA] text-[#00B42A]", // Green
  "border-transparent bg-[#F5E8FF] text-[#722ED1]", // Purple
];

const getNotionTagClass = (index: number) => notionTagPalette[index % notionTagPalette.length];
const statusOptions = Object.keys(statusConfig) as Array<keyof typeof statusConfig>;

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

function isApplicationOpen(deadline: string) {
  const v = deadline.trim();
  if (!v) return false;
  if (/rolling/i.test(v)) return true;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d >= today;
}

export default function WorkspacePage() {
  const { result } = useMatchResult();
  const {
    data: questionnaireData,
    isLoaded: questionnaireLoaded,
    saveData,
    getCompletionStatus,
  } = useQuestionnaire();
  const [addedProgramIds, setAddedProgramIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<Record<string, ApplicationItem["status"]>>({});
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"dashboard" | "background">("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isBackgroundEditing, setIsBackgroundEditing] = useState(false);
  const [backgroundDraft, setBackgroundDraft] = useState<
    Pick<QuestionnaireData, "personalInfo" | "workExperience" | "projects"> | null
  >(null);
  const [draftRefresh, setDraftRefresh] = useState(0);
  /** 避免在首屏 render 中读 localStorage，与 SSR 空草稿树一致，消除 hydration mismatch */
  const [draftStorageReady, setDraftStorageReady] = useState(false);
  const [showAllSchoolDrafts, setShowAllSchoolDrafts] = useState(false);
  const [usageGuideOpen, setUsageGuideOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    overview: false,
    orientation: false,
    highlights: false,
    curriculum: false,
  });

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

  useEffect(() => {
    setExpandedSections({
      overview: false,
      orientation: false,
      highlights: false,
      curriculum: false,
    });
  }, [selectedProgramId]);

  useEffect(() => {
    if (isBackgroundEditing) return;
    setBackgroundDraft({
      personalInfo: questionnaireData.personalInfo,
      workExperience: questionnaireData.workExperience,
      projects: questionnaireData.projects,
    });
  }, [isBackgroundEditing, questionnaireData]);

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

  const schoolsInWorkspace = useMemo(() => {
    const map = new Map<string, School>();
    addedPrograms.forEach(({ school }) => map.set(school.id, school));
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  }, [addedPrograms]);

  const programsBySchool = useMemo(() => {
    const grouped = new Map<string, Program[]>();
    for (const { program, school } of addedPrograms) {
      const list = grouped.get(school.id) ?? [];
      list.push(program);
      grouped.set(school.id, list);
    }
    for (const [, list] of grouped) {
      list.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    }
    return grouped;
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

  const selectedProgramPair = useMemo(() => {
    if (!result || !selectedProgramId) return null;
    const program = result.programs.find((p) => p.id === selectedProgramId);
    if (!program) return null;
    const school = result.schools.find((s) => s.id === program.schoolId);
    if (!school) return null;
    return { program, school };
  }, [result, selectedProgramId]);

  const selectedProgramExtra = useMemo(() => {
    if (!selectedProgramPair) return null;
    return getProgramEnrichment(selectedProgramPair.program, selectedProgramPair.school);
  }, [selectedProgramPair]);

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
  const questionnaireCompletion = useMemo(
    () => getCompletionStatus(),
    [getCompletionStatus]
  );
  const questionnaireProgress = Math.round(
    (questionnaireCompletion.completedSteps.length / 8) * 100
  );

  const updateStatus = (programId: string, status: ApplicationItem["status"]) => {
    const updated = { ...applications, [programId]: status };
    setApplications(updated);
    localStorage.setItem("edumatch_application_status", JSON.stringify(updated));
    setLiveMessage(`申请状态已更新为${statusConfig[status].label}`);
  };

  const removeProgram = (programId: string) => {
    const updated = addedProgramIds.filter((id) => id !== programId);
    setAddedProgramIds(updated);
    localStorage.setItem("edumatch_added_programs", JSON.stringify(updated));
  };

  const selectSchool = (id: string | null) => {
    setSelectedProgramId(null);
    setSelectedSchoolId(id);
  };

  const jumpToApplicationList = () => {
    if (typeof window === "undefined") return;
    const node = document.getElementById("workspace-application-list");
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openProgramDetail = (program: Program) => {
    setSelectedProgramId(program.id);
    setLiveMessage(`已打开项目详情：${program.nameEn}`);
  };

  const renderStatusMenu = (
    programId: string,
    status: keyof typeof statusConfig,
    compact?: boolean
  ) => {
    const current = statusConfig[status];
    return (
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 px-2",
            compact && "h-7 px-1.5"
          )}
          aria-label="修改申请状态"
          onClick={(e) => e.stopPropagation()}
        >
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", current.color)}>
            {current.label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => {
          const active = option === status;
          return (
            <DropdownMenuItem
              key={option}
              onClick={() => updateStatus(programId, option)}
              className={cn("flex items-center justify-between gap-2", active && "font-medium")}
            >
              <span>{statusConfig[option].label}</span>
              {active ? <Check className="h-3.5 w-3.5" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
    );
  };

  const toggleDetailSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const jumpToDetailSection = (id: string) => {
    if (typeof window === "undefined") return;
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openQuestionnaire = () => {
    if (typeof window === "undefined") return;
    window.location.href = "/questionnaire";
  };

  const openBackgroundSummary = () => {
    setSelectedSchoolId(null);
    setSelectedProgramId(null);
    setActiveView("background");
  };

  const updateBackgroundPersonalInfo = (
    field: keyof QuestionnaireData["personalInfo"],
    value: string
  ) => {
    setBackgroundDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value,
        },
      };
    });
  };

  const updateBackgroundWork = (
    index: number,
    field: keyof QuestionnaireData["workExperience"][number],
    value: string
  ) => {
    setBackgroundDraft((prev) => {
      if (!prev) return prev;
      const next = prev.workExperience.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, workExperience: next };
    });
  };

  const updateBackgroundProject = (
    index: number,
    field: keyof QuestionnaireData["projects"][number],
    value: string
  ) => {
    setBackgroundDraft((prev) => {
      if (!prev) return prev;
      const next = prev.projects.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, projects: next };
    });
  };

  const cancelBackgroundEdit = () => {
    setIsBackgroundEditing(false);
    setBackgroundDraft({
      personalInfo: questionnaireData.personalInfo,
      workExperience: questionnaireData.workExperience,
      projects: questionnaireData.projects,
    });
  };

  const saveBackgroundEdit = () => {
    if (!backgroundDraft) return;
    saveData({
      personalInfo: backgroundDraft.personalInfo,
      workExperience: backgroundDraft.workExperience,
      projects: backgroundDraft.projects,
    });
    setIsBackgroundEditing(false);
    setLiveMessage("我的背景已保存");
  };

  const sidebarBody = (opts: { onPick?: () => void }) => (
    <>
      <div className="px-3 pb-4">
        <p className="ui-section-heading mb-2 px-2">浏览</p>
        <nav className="space-y-0.5" aria-label="浏览">
          <button
            type="button"
            onClick={() => {
              setSelectedSchoolId(null);
              setSelectedProgramId(null);
              setActiveView("dashboard");
              opts.onPick?.();
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              selectedSchoolId == null && activeView === "dashboard"
                ? "bg-interactive-active text-foreground"
                : "text-foreground/82 hover:bg-interactive-hover hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4 shrink-0 text-foreground/70" />
            <span className="flex-1 truncate">仪表盘</span>
            {addedPrograms.length > 0 && (
              <span className="text-xs text-foreground/72 tabular-nums">{addedPrograms.length}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              opts.onPick?.();
              openBackgroundSummary();
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              activeView === "background"
                ? "bg-interactive-active text-foreground"
                : "text-foreground/82 hover:bg-interactive-hover hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4 shrink-0 text-foreground/70" />
            <span className="flex-1 truncate">我的背景</span>
          </button>
        </nav>
      </div>

      <div className="px-3 pb-4">
        <p className="ui-section-heading mb-2 px-2">学校</p>
        {schoolsInWorkspace.length === 0 ? (
          <p className="px-2 text-xs leading-relaxed text-foreground/68">
            请先在选校结果页勾选项目，列表会自动同步
          </p>
        ) : (
          <ScrollArea className="h-[min(40vh,280px)] pr-2">
            <div className="space-y-0.5">
              {schoolsInWorkspace.map((school) => {
                const active = selectedSchoolId === school.id;
                const count = addedPrograms.filter((p) => p.school.id === school.id).length;
                const schoolPrograms = programsBySchool.get(school.id) ?? [];
                return (
                  <div key={school.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        selectSchool(active ? null : school.id);
                        opts.onPick?.();
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        active
                          ? "bg-interactive-active text-foreground"
                          : "text-foreground/82 hover:bg-interactive-hover hover:text-foreground"
                      )}
                    >
                      <SchoolLogoMark school={school} size="sidebar" rounded="md" />
                      <span className="min-w-0 flex-1 truncate">{school.name}</span>
                      <span className="text-xs text-foreground/72 tabular-nums">{count}</span>
                    </button>

                    {active && schoolPrograms.length > 0 && (
                      <div className="ml-8 space-y-0.5 border-l border-border/60 pl-2">
                        {schoolPrograms.map((program) => (
                          <button
                            key={program.id}
                            type="button"
                            onClick={() => {
                              openProgramDetail(program);
                              opts.onPick?.();
                            }}
                            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs text-foreground/75 transition-colors hover:bg-muted/40 hover:text-foreground"
                            title={program.nameEn}
                          >
                            <File className="h-3.5 w-3.5 shrink-0 text-foreground/65" />
                            <span className="min-w-0 flex-1 truncate">{program.nameEn}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="px-3 pb-4">
        <p className="ui-section-heading mb-2 px-2">我的文书</p>
        {draftSummaries.length === 0 ? (
          <p className="px-2 text-xs leading-relaxed text-foreground/68">
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
                      className="flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-foreground/82 transition-colors duration-150 ease-in-out hover:bg-interactive-hover hover:text-foreground"
                      aria-label={labelForDraftProgram(d.programId)}
                      title={labelForDraftProgram(d.programId)}
                    >
                      <PenLine className="h-4 w-4 shrink-0 text-foreground/70" />
                      <span className="min-w-0 flex-1 truncate text-xs leading-snug text-foreground">
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
    <div className="border-t border-border/60 bg-sidebar px-3 py-3">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            setUsageGuideOpen(true);
            opts.onPick?.();
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors duration-150 ease-in-out hover:bg-interactive-hover hover:text-foreground"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <span>使用说明</span>
        </button>
        <a
          href="mailto:?subject=EduMatch%20%E7%94%A8%E6%88%B7%E5%8F%8D%E9%A6%88"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors duration-150 ease-in-out hover:bg-interactive-hover hover:text-foreground"
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
      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar — Notion-like */}
        <aside className="hidden min-h-0 w-[260px] shrink-0 flex-col border-r border-border/80 bg-sidebar md:flex">
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
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
                  : activeView === "background"
                    ? "我的背景"
                    : "仪表盘"}
              </p>
            </div>
            <Link href="/" className="shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            </Link>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:py-8">
            <div className={cn("mx-auto", selectedSchool || selectedProgramPair ? "max-w-4xl" : "max-w-6xl")}>
              {!selectedSchool && !selectedProgramPair && activeView === "dashboard" ? (
                <div className="mb-6 flex justify-end">
                  <WorkspaceBuddy className="pt-2 sm:pt-3" />
                </div>
              ) : null}

              {selectedProgramPair && (
                <section className="space-y-4">
                  <nav className="mb-1" aria-label="项目层级导航">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      aria-label="返回项目列表"
                      onClick={() => {
                        setSelectedProgramId(null);
                        setLiveMessage("已返回项目列表");
                      }}
                    >
                      <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                      <span>申请列表</span>
                      <span className="text-muted-foreground/70">/</span>
                      <span>{selectedProgramPair.school.nameEn}</span>
                      <span className="text-muted-foreground/70">/</span>
                      <span className="max-w-[24ch] truncate">{selectedProgramPair.program.nameEn}</span>
                    </Button>
                  </nav>

                  <div className="space-y-4">
                    <div className="ui-card px-4 py-4 sm:px-5">
                      <div className="flex items-start gap-3">
                        <SchoolLogoMark school={selectedProgramPair.school} size="row" rounded="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-foreground sm:text-lg">
                            {selectedProgramPair.program.nameEn}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {selectedProgramPair.school.nameEn} · {selectedProgramPair.program.degree} ·{" "}
                            {selectedProgramPair.program.duration}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {renderStatusMenu(
                            selectedProgramPair.program.id,
                            (applications[selectedProgramPair.program.id] || "todo") as keyof typeof statusConfig
                          )}
                          {selectedProgramExtra?.links?.[0]?.url ? (
                            <Button
                              size="sm"
                              asChild
                            >
                              <a
                                href={selectedProgramExtra.links[0].url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                项目链接
                              </a>
                            </Button>
                          ) : null}
                          <Button size="sm" className="shrink-0" asChild>
                            <Link href={`/workspace/write/${selectedProgramPair.program.id}`}>
                              <PenLine className="h-3.5 w-3.5" />
                              写文书
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 rounded-xl border border-border/80 bg-surface-muted px-4 py-3 text-xs sm:grid-cols-2 lg:grid-cols-4 sm:px-5">
                      <div className="rounded-md border border-border/70 bg-background px-3 py-2" aria-label="学制信息">
                        <p className="text-muted-foreground">学制</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{selectedProgramPair.program.duration}</p>
                      </div>
                      <div className="rounded-md border border-border/70 bg-background px-3 py-2" aria-label="申请截止日期">
                        <p className="text-muted-foreground">申请截止</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{selectedProgramPair.program.deadline}</p>
                      </div>
                      <div className="rounded-md border border-border/70 bg-background px-3 py-2" aria-label="项目学费">
                        <p className="text-muted-foreground">学费</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{selectedProgramPair.program.tuition}</p>
                      </div>
                      <div className="rounded-md border border-border/70 bg-background px-3 py-2" aria-label="所在城市与国家">
                        <p className="text-muted-foreground">地点</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {selectedProgramPair.school.city} · {selectedProgramPair.school.country}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                      <div className="space-y-3">
                        <section id="section-facts" className="rounded-md border border-border/70 bg-surface-muted">
                          <div className="border-b border-border/70 px-3 py-2">
                            <p className="text-xs font-medium text-muted-foreground">项目信息</p>
                          </div>
                          <div className="divide-y divide-border/70 text-sm">
                            <div className="flex items-center justify-between px-3 py-2.5">
                              <span className="text-muted-foreground">院系</span>
                              <span className="font-medium text-foreground">{selectedProgramPair.program.department}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2.5">
                              <span className="text-muted-foreground">类型</span>
                              <span className="font-medium text-foreground">{selectedProgramPair.program.degree}</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2.5">
                              <span className="text-muted-foreground">QS 排名</span>
                              <span className="font-medium text-foreground">#{selectedProgramPair.school.ranking}</span>
                            </div>
                          </div>
                        </section>

                        <section id="section-overview" className="rounded-md border border-border/70 p-3">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-2 text-left"
                            aria-expanded={expandedSections.overview}
                            aria-controls="section-overview-content"
                            onClick={() => toggleDetailSection("overview")}
                          >
                            <p className="text-xs font-medium text-muted-foreground">项目简介</p>
                            <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedSections.overview && "rotate-90")} />
                          </button>
                          <p
                            id="section-overview-content"
                            className={cn(
                              "pt-2 text-sm leading-relaxed text-foreground/90",
                              expandedSections.overview ? "" : "line-clamp-3"
                            )}
                          >
                            {selectedProgramPair.program.description}
                          </p>
                        </section>

                        {selectedProgramExtra && (
                          <>
                            <section id="section-orientation" className="rounded-md border border-border/70 p-3">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between gap-2 text-left"
                                aria-expanded={expandedSections.orientation}
                                aria-controls="section-orientation-content"
                                onClick={() => toggleDetailSection("orientation")}
                              >
                                <p className="text-xs font-medium text-muted-foreground">培养定位</p>
                                <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedSections.orientation && "rotate-90")} />
                              </button>
                              <p
                                id="section-orientation-content"
                                className={cn(
                                  "pt-2 text-sm leading-relaxed text-foreground/90",
                                  expandedSections.orientation ? "" : "line-clamp-2"
                                )}
                              >
                                {selectedProgramExtra.orientation}
                              </p>
                            </section>

                            <section id="section-highlights" className="rounded-md border border-border/70 p-3">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between gap-2 text-left"
                                aria-expanded={expandedSections.highlights}
                                aria-controls="section-highlights-content"
                                onClick={() => toggleDetailSection("highlights")}
                              >
                                <p className="text-xs font-medium text-muted-foreground">项目亮点</p>
                                <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedSections.highlights && "rotate-90")} />
                              </button>
                              <ul
                                id="section-highlights-content"
                                className={cn(
                                  "space-y-1.5 pt-2",
                                  expandedSections.highlights ? "" : "max-h-20 overflow-hidden"
                                )}
                              >
                                {selectedProgramExtra.highlights.map((item, idx) => (
                                  <li key={idx} className="text-sm text-foreground/90">
                                    - {item}
                                  </li>
                                ))}
                              </ul>
                            </section>

                            <section id="section-curriculum" className="rounded-md border border-border/70 p-3">
                              <button
                                type="button"
                                className="flex w-full items-center justify-between gap-2 text-left"
                                aria-expanded={expandedSections.curriculum}
                                aria-controls="section-curriculum-content"
                                onClick={() => toggleDetailSection("curriculum")}
                              >
                                <p className="text-xs font-medium text-muted-foreground">课程方向</p>
                                <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedSections.curriculum && "rotate-90")} />
                              </button>
                              <div
                                id="section-curriculum-content"
                                className={cn(
                                  "flex flex-wrap gap-1.5 pt-2",
                                  expandedSections.curriculum ? "" : "max-h-14 overflow-hidden"
                                )}
                              >
                                {selectedProgramExtra.curriculum.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className={cn(
                                      "rounded-full px-2.5 py-1 text-xs",
                                      "border-transparent bg-chip-info-bg text-chip-info-text"
                                    )}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </section>
                          </>
                        )}
                      </div>

                      <aside className="space-y-3">
                            <div className="space-y-2 rounded-md border border-border/70 p-3">
                          <p className="text-xs font-medium text-muted-foreground">申请要求</p>
                              {selectedProgramPair.program.requirements.map((req, idx) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-xs",
                                    "border-transparent bg-chip-info-bg text-chip-info-text"
                                  )}
                                >
                                  {req}
                                </div>
                              ))}
                        </div>

                        {selectedProgramExtra && (
                          <>
                            <div className="space-y-2 rounded-md border border-border/70 p-3">
                              <p className="text-xs font-medium text-muted-foreground">申请材料清单</p>
                              <ul className="space-y-1.5">
                                {selectedProgramExtra.applicationChecklist.map((item, idx) => (
                                  <li key={idx} className="text-xs text-foreground/85">
                                    - {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-2 rounded-md border border-border/70 p-3">
                              <p className="text-xs font-medium text-muted-foreground">时间线</p>
                              <ul className="space-y-1.5">
                                {selectedProgramExtra.timeline.map((item, idx) => (
                                  <li key={idx} className="text-xs text-foreground/85">
                                    {idx + 1}. {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}

                        {selectedProgramExtra && selectedProgramExtra.links.length > 0 && (
                          <div className="space-y-2 rounded-md border border-border/70 p-3">
                            <p className="text-xs font-medium text-muted-foreground">外部信息</p>
                            <div className="space-y-1.5">
                              {selectedProgramExtra.links.map((item) => (
                                <a
                                  key={item.url}
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-xs text-foreground/85 underline decoration-border underline-offset-2 hover:decoration-foreground"
                                >
                                  <span>{item.label}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </aside>
                    </div>
                  </div>
                </section>
              )}

              {!selectedSchool && !selectedProgramPair && activeView === "dashboard" && (
                <section className="mb-8 space-y-5" aria-label="申请概览仪表盘">
                  {questionnaireLoaded ? (
                    <Card className="gap-0 border-border/80 py-0 shadow-none">
                      <CardContent className="px-4 py-2.5">
                        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                          <span>背景资料完成度</span>
                          <span className="tabular-nums">{questionnaireProgress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-foreground/80 transition-all duration-300"
                            style={{ width: `${questionnaireProgress}%` }}
                          />
                        </div>
                        {questionnaireCompletion.canGenerateMatch ? (
                          <p className="mt-1.5 text-xs text-muted-foreground">必填信息已完整，可继续补充背景。</p>
                        ) : (
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              还不能正式匹配：请先完成个人信息与教育背景。
                            </p>
                            <Button size="sm" variant="outline" className="h-8" onClick={openQuestionnaire}>
                              继续完善
                            </Button>
                          </div>
                        )}
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
                        <button
                          type="button"
                          onClick={() => jumpToApplicationList()}
                          className="rounded-lg border border-border/70 bg-surface-muted px-4 py-3.5 text-left transition-colors hover:bg-surface-muted-hover"
                        >
                          <span className="ui-field-label font-medium tracking-wide">项目</span>
                          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                            {dashboardStats.programs}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            jumpToApplicationList();
                          }}
                          className="rounded-lg border border-border/70 bg-surface-muted px-4 py-3.5 text-left transition-colors hover:bg-surface-muted-hover"
                        >
                          <span className="ui-field-label font-medium tracking-wide">院校</span>
                          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                            {dashboardStats.schools}
                          </p>
                        </button>
                        <div className="rounded-lg border border-border/70 bg-surface-muted px-4 py-3.5">
                          <span className="ui-field-label font-medium tracking-wide">待申请</span>
                          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                            {dashboardStats.todo}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-surface-muted px-4 py-3.5">
                          <span className="ui-field-label font-medium tracking-wide">进行中</span>
                          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                            {dashboardStats.active}
                          </p>
                        </div>
                      </div>
                    </section>
                  ) : null}

                </section>
              )}

              {!selectedSchool && !selectedProgramPair && activeView === "background" && (
                <section className="space-y-5" aria-label="我的背景">
                  <div className="flex justify-end gap-2">
                    {isBackgroundEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-chip-info-text/40 text-chip-info-text hover:bg-chip-info-bg"
                          onClick={cancelBackgroundEdit}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#2378D9] text-white hover:bg-[#2378D9]"
                          onClick={saveBackgroundEdit}
                        >
                          保存
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-chip-info-text/40 text-chip-info-text hover:bg-chip-info-bg"
                        onClick={() => setIsBackgroundEditing(true)}
                      >
                        编辑
                      </Button>
                    )}
                  </div>
                  <Card className="border-border/80 bg-background shadow-none">
                    <CardHeader className="pb-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4 text-muted-foreground" />
                        基本信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                        <div className="space-y-1 border-b border-border/60 pb-2 sm:border-0 sm:pb-0">
                          <p className="ui-field-label tracking-wide">称呼</p>
                          {isBackgroundEditing ? (
                            <Input
                              value={backgroundDraft?.personalInfo.fullName || ""}
                              onChange={(e) => updateBackgroundPersonalInfo("fullName", e.target.value)}
                              className="h-8 border-border/70 bg-background/80"
                            />
                          ) : (
                            <p className="font-medium text-foreground">{questionnaireData.personalInfo.fullName || "未填"}</p>
                          )}
                        </div>
                        <div className="space-y-1 border-b border-border/60 pb-2 sm:border-0 sm:pb-0">
                          <p className="ui-field-label tracking-wide">专业</p>
                          {isBackgroundEditing ? (
                            <Input
                              value={backgroundDraft?.personalInfo.intendedMajor || ""}
                              onChange={(e) => updateBackgroundPersonalInfo("intendedMajor", e.target.value)}
                              className="h-8 border-border/70 bg-background/80"
                            />
                          ) : (
                            <p className="font-medium text-foreground">{questionnaireData.personalInfo.intendedMajor || "未填"}</p>
                          )}
                        </div>
                        <div className="space-y-1 border-b border-border/60 pb-2 sm:border-0 sm:pb-0">
                          <p className="ui-field-label tracking-wide">领域</p>
                          {isBackgroundEditing ? (
                            <Input
                              value={backgroundDraft?.personalInfo.intendedApplicationField || ""}
                              onChange={(e) => updateBackgroundPersonalInfo("intendedApplicationField", e.target.value)}
                              className="h-8 border-border/70 bg-background/80"
                            />
                          ) : (
                            <p className="font-medium text-foreground">{questionnaireData.personalInfo.intendedApplicationField || "未填"}</p>
                          )}
                        </div>
                        <div className="space-y-1 border-b border-border/60 pb-2 sm:border-0 sm:pb-0">
                          <p className="ui-field-label tracking-wide">入学</p>
                          {isBackgroundEditing ? (
                            <Input
                              value={backgroundDraft?.personalInfo.targetSemester || ""}
                              onChange={(e) => updateBackgroundPersonalInfo("targetSemester", e.target.value)}
                              className="h-8 border-border/70 bg-background/80"
                            />
                          ) : (
                            <p className="font-medium text-foreground">{questionnaireData.personalInfo.targetSemester || "未填"}</p>
                          )}
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <p className="ui-field-label tracking-wide">预算</p>
                          {isBackgroundEditing ? (
                            <Input
                              value={backgroundDraft?.personalInfo.budgetEstimate || ""}
                              onChange={(e) => updateBackgroundPersonalInfo("budgetEstimate", e.target.value)}
                              className="h-8 border-border/70 bg-background/80"
                            />
                          ) : (
                            <p className="font-medium text-foreground">{questionnaireData.personalInfo.budgetEstimate || "未填"}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/80 bg-background shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        工作经历
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(isBackgroundEditing ? backgroundDraft?.workExperience : questionnaireData.workExperience)?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">未填</p>
                      ) : (
                        (isBackgroundEditing ? backgroundDraft?.workExperience : questionnaireData.workExperience)?.map((work, index) => (
                          <article key={work.id} className="ui-card-inset-soft p-3.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              {isBackgroundEditing ? (
                                <div className="grid w-full gap-2 sm:grid-cols-2">
                                  <Input
                                    value={work.company}
                                    onChange={(e) => updateBackgroundWork(index, "company", e.target.value)}
                                    placeholder="公司"
                                    className="h-8 border-border/70 bg-background/80"
                                  />
                                  <Input
                                    value={work.position}
                                    onChange={(e) => updateBackgroundWork(index, "position", e.target.value)}
                                    placeholder="岗位"
                                    className="h-8 border-border/70 bg-background/80"
                                  />
                                  <Input
                                    value={work.startDate}
                                    onChange={(e) => updateBackgroundWork(index, "startDate", e.target.value)}
                                    placeholder="开始时间"
                                    className="h-8 border-border/70 bg-background/80"
                                  />
                                  <Input
                                    value={work.endDate}
                                    onChange={(e) => updateBackgroundWork(index, "endDate", e.target.value)}
                                    placeholder="结束时间"
                                    className="h-8 border-border/70 bg-background/80"
                                  />
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm font-semibold text-foreground">
                                    {(work.company || "未填公司")} · {(work.position || "未填岗位")}
                                  </p>
                                  <span className="rounded-md border border-transparent bg-chip-info-bg px-2 py-0.5 text-ui-label text-chip-info-text">
                                    {work.startDate || "未知开始"} - {work.isCurrent ? "至今" : (work.endDate || "未知结束")}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                              {isBackgroundEditing ? (
                                <div className="space-y-2">
                                  <Input value={work.situation} onChange={(e) => updateBackgroundWork(index, "situation", e.target.value)} placeholder="背景" className="h-8 border-border/70 bg-background/80 text-xs" />
                                  <Input value={work.task} onChange={(e) => updateBackgroundWork(index, "task", e.target.value)} placeholder="职责" className="h-8 border-border/70 bg-background/80 text-xs" />
                                  <Input value={work.action} onChange={(e) => updateBackgroundWork(index, "action", e.target.value)} placeholder="行动" className="h-8 border-border/70 bg-background/80 text-xs" />
                                  <Input value={work.result} onChange={(e) => updateBackgroundWork(index, "result", e.target.value)} placeholder="结果" className="h-8 border-border/70 bg-background/80 text-xs" />
                                </div>
                              ) : (
                                <>
                                  {work.situation && <p><span className="font-medium text-foreground/85">背景：</span>{work.situation}</p>}
                                  {work.task && <p><span className="font-medium text-foreground/85">职责：</span>{work.task}</p>}
                                  {work.action && <p><span className="font-medium text-foreground/85">行动：</span>{work.action}</p>}
                                  {work.result && <p><span className="font-medium text-foreground/85">结果：</span>{work.result}</p>}
                                </>
                              )}
                            </div>
                          </article>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/80 bg-background shadow-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                        项目经历
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(isBackgroundEditing ? backgroundDraft?.projects : questionnaireData.projects)?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">未填</p>
                      ) : (
                        (isBackgroundEditing ? backgroundDraft?.projects : questionnaireData.projects)?.map((proj, index) => (
                          <article key={proj.id} className="ui-card-inset-soft p-3.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              {isBackgroundEditing ? (
                                <div className="grid w-full gap-2 sm:grid-cols-2">
                                  <Input
                                    value={proj.name}
                                    onChange={(e) => updateBackgroundProject(index, "name", e.target.value)}
                                    placeholder="项目名"
                                    className="h-8 border-border/70 bg-background/80"
                                  />
                                  <Input
                                    value={proj.role}
                                    onChange={(e) => updateBackgroundProject(index, "role", e.target.value)}
                                    placeholder="角色"
                                    className="h-8 border-border/70 bg-background/80"
                                  />
                                  <Input
                                    value={proj.startDate}
                                    onChange={(e) => updateBackgroundProject(index, "startDate", e.target.value)}
                                    placeholder="开始时间"
                                    className="h-8 border-border/70 bg-background/80"
                                  />
                                  <Input
                                    value={proj.endDate}
                                    onChange={(e) => updateBackgroundProject(index, "endDate", e.target.value)}
                                    placeholder="结束时间"
                                    className="h-8 border-border/70 bg-background/80"
                                  />
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm font-semibold text-foreground">
                                    {(proj.name || "未填项目")} · {(proj.role || "未填角色")}
                                  </p>
                                  <span className="rounded-md border border-transparent bg-chip-info-bg px-2 py-0.5 text-ui-label text-chip-info-text">
                                    {proj.startDate || "未知开始"} - {(proj.endDate || "未知结束")}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                              {isBackgroundEditing ? (
                                <div className="space-y-2">
                                  <Input value={proj.situation} onChange={(e) => updateBackgroundProject(index, "situation", e.target.value)} placeholder="背景" className="h-8 border-border/70 bg-background/80 text-xs" />
                                  <Input value={proj.task} onChange={(e) => updateBackgroundProject(index, "task", e.target.value)} placeholder="职责" className="h-8 border-border/70 bg-background/80 text-xs" />
                                  <Input value={proj.action} onChange={(e) => updateBackgroundProject(index, "action", e.target.value)} placeholder="行动" className="h-8 border-border/70 bg-background/80 text-xs" />
                                  <Input value={proj.result} onChange={(e) => updateBackgroundProject(index, "result", e.target.value)} placeholder="结果" className="h-8 border-border/70 bg-background/80 text-xs" />
                                </div>
                              ) : (
                                <>
                                  {proj.situation && <p><span className="font-medium text-foreground/85">背景：</span>{proj.situation}</p>}
                                  {proj.task && <p><span className="font-medium text-foreground/85">职责：</span>{proj.task}</p>}
                                  {proj.action && <p><span className="font-medium text-foreground/85">行动：</span>{proj.action}</p>}
                                  {proj.result && <p><span className="font-medium text-foreground/85">结果：</span>{proj.result}</p>}
                                </>
                              )}
                            </div>
                          </article>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </section>
              )}

              {selectedSchool && !selectedProgramPair && (
                <div className="mb-6 space-y-3">
                  <div className="rounded-lg border border-border bg-card px-4 py-3">
                    <div className="flex items-start gap-3">
                      <SchoolLogoMark school={selectedSchool} size="row" rounded="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{selectedSchool.nameEn}</p>
                        <p className="truncate text-xs text-muted-foreground">{selectedSchool.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn("text-ui-label", "border-transparent bg-chip-info-bg text-chip-info-text")}
                          >
                            QS #{selectedSchool.ranking}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn("text-ui-label", "border-transparent bg-chip-info-bg text-chip-info-text")}
                          >
                            {selectedSchool.city} · {selectedSchool.country}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn("text-ui-label", "border-transparent bg-chip-accent-bg text-chip-accent-text")}
                          >
                            {displayPrograms.length} 个项目
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  {(selectedSchool.campusStyle || selectedSchool.locationAndSetting || selectedSchool.studentLife) && (
                    <section className="rounded-lg border border-border bg-card px-4 py-3">
                      <div className="mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <h2 className="text-sm font-medium text-foreground">院校介绍</h2>
                      </div>
                      <SchoolRichInfo school={selectedSchool} />
                    </section>
                  )}
                </div>
              )}

              {selectedSchool && !selectedProgramPair && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <h2 className="text-sm font-medium text-foreground">已保存文书</h2>
                  </div>
                  {schoolDraftSheets.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border/80 bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
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
                                    <p className="text-ui-label font-semibold tracking-wide text-foreground/90">
                                      {DOCUMENT_DRAFT_LABELS[sheet.kind]}
                                    </p>
                                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                      {sheet.programNameEn}
                                    </p>
                                  </div>
                                  <PenLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                                <div className="min-h-0 flex-1 overflow-hidden pt-3">
                                  <p className="line-clamp-[14] whitespace-pre-wrap break-words font-serif text-ui-label leading-[1.65] text-foreground/85">
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

              {!selectedSchool && !selectedProgramPair && activeView === "dashboard" && addedPrograms.length > 0 && (
                <div id="workspace-application-list" className="mb-4 flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <h2 className="text-sm font-medium text-foreground">申请列表</h2>
                </div>
              )}

              {!selectedProgramPair && activeView === "dashboard" &&
              (addedPrograms.length === 0 ? (
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
                        <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-4 py-3">
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
                          const useDetailedCard = selectedSchoolId === school.id;
                          const showOpenDeadline = isApplicationOpen(program.deadline);

                          return (
                            <div
                              key={program.id}
                              className={cn(
                                "p-3.5 sm:p-4",
                                useDetailedCard
                                  ? "space-y-3"
                                  : "flex flex-col gap-3 transition-colors hover:bg-surface-muted sm:flex-row sm:items-center sm:justify-between"
                              )}
                            >
                              {useDetailedCard ? (
                                <div className="space-y-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openProgramDetail(program)}
                                    className="block w-full px-1 py-1.5 text-left transition-colors hover:bg-surface-muted"
                                  >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                      {program.nameEn}
                                    </p>
                                    <Badge variant="outline" className={cn("font-normal", statusInfo.color)}>
                                      {statusInfo.label}
                                    </Badge>
                                  </div>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                    <span>{program.degree}</span>
                                    <span aria-hidden>·</span>
                                    <span>{program.duration}</span>
                                    <span aria-hidden>·</span>
                                    <span>{program.deadline}</span>
                                  </div>
                                  {programIdsWithDrafts.has(program.id) && (
                                    <p className="mt-1.5 text-xs text-muted-foreground">已保存草稿</p>
                                  )}
                                  </button>
                                </div>
                              ) : (
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <h4 className="font-medium text-foreground">{program.nameEn}</h4>
                                    <Badge variant="outline" className={cn("font-normal", statusInfo.color)}>
                                      {statusInfo.label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {program.degree} · {program.duration} · {program.tuition}
                                  </p>
                                  {showOpenDeadline && (
                                    <p className="mt-1.5 inline-flex rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/35 dark:text-amber-200">
                                      截止 {program.deadline}
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className={cn("flex shrink-0 flex-wrap items-center gap-1.5", useDetailedCard && "hidden")}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-xl shadow-none"
                                      aria-label="查看项目"
                                      onClick={() => openProgramDetail(program)}
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">查看项目</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ))}
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
                  <li>左侧「仪表盘」与学校列表可切换视图；顶部搜索可过滤项目。</li>
                  <li>「仪表盘」主区包含指标卡片与快速入口；列表在下方。</li>
                  <li>列表中可改申请状态；「写文书」进入草稿编辑，草稿保存在本机浏览器。</li>
                  <li>侧栏「我的文书」汇总有内容的草稿；返回本页或切换窗口后会自动刷新状态。</li>
                </ul>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="flex min-h-0 w-[280px] flex-col gap-0 border-r border-border/80 bg-sidebar p-0 sm:max-w-[280px]"
        >
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
