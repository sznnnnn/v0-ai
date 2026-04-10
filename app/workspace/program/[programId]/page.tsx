"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { SchoolLogoMark } from "@/components/match/school-logo-mark";
import { SchoolRichInfo } from "@/components/match/school-rich-info";
import { useMatchResult } from "@/hooks/use-questionnaire";
import { clearProgramDrafts, DOCUMENT_DRAFT_ORDER, getDraft } from "@/lib/document-drafts";

const ADDED_PROGRAMS_KEY = "edumatch_added_programs";
const FAVORITE_PROGRAMS_KEY = "edumatch_favorite_programs";

function formatDate(v: string) {
  if (!v) return "未填写";
  return v;
}

function parseMoney(value: string): number | null {
  const numeric = value.replace(/[^0-9.]/g, "");
  if (!numeric) return null;
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : null;
}

function estimateCny(value: string): string | null {
  const raw = parseMoney(value);
  if (!raw) return null;
  const cny = Math.round(raw * 9.5);
  return `约 ¥${cny.toLocaleString("zh-CN")}`;
}

export default function ProgramDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const programId = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const raw = parts[parts.length - 1] ?? "";
    return decodeURIComponent(raw);
  }, [pathname]);
  const { result, isLoaded } = useMatchResult();
  const [addedPrograms, setAddedPrograms] = useState<string[]>([]);
  const [favoritePrograms, setFavoritePrograms] = useState<string[]>([]);
  const [writeChoiceOpen, setWriteChoiceOpen] = useState(false);

  useEffect(() => {
    const addedRaw = localStorage.getItem(ADDED_PROGRAMS_KEY);
    const favoriteRaw = localStorage.getItem(FAVORITE_PROGRAMS_KEY);
    if (addedRaw) {
      try {
        setAddedPrograms(JSON.parse(addedRaw) as string[]);
      } catch {
        setAddedPrograms([]);
      }
    }
    if (favoriteRaw) {
      try {
        setFavoritePrograms(JSON.parse(favoriteRaw) as string[]);
      } catch {
        setFavoritePrograms([]);
      }
    }
  }, []);

  const pair = useMemo(() => {
    if (!result || !programId) return null;
    const program = result.programs.find((p) => p.id === programId);
    if (!program) return null;
    const school = result.schools.find((s) => s.id === program.schoolId);
    if (!school) return null;
    return { program, school };
  }, [result, programId]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="min-h-screen bg-background">
        <GuestBanner />
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">未找到该项目，可能匹配结果已更新。</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/workspace">返回工作台</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { program, school } = pair;
  const isAdded = addedPrograms.includes(program.id);
  const isFavorite = favoritePrograms.includes(program.id);
  const tuitionCny = estimateCny(program.tuition);

  const toggleApply = () => {
    const updated = isAdded
      ? addedPrograms.filter((id) => id !== program.id)
      : [...new Set([...addedPrograms, program.id])];
    setAddedPrograms(updated);
    localStorage.setItem(ADDED_PROGRAMS_KEY, JSON.stringify(updated));
  };

  const toggleFavorite = () => {
    const updated = isFavorite
      ? favoritePrograms.filter((id) => id !== program.id)
      : [...new Set([...favoritePrograms, program.id])];
    setFavoritePrograms(updated);
    localStorage.setItem(FAVORITE_PROGRAMS_KEY, JSON.stringify(updated));
  };

  const hasExistingDraft = DOCUMENT_DRAFT_ORDER.some((kind) => Boolean(getDraft(program.id, kind)?.content?.trim()));

  const handleWriteClick = () => {
    if (hasExistingDraft) {
      setWriteChoiceOpen(true);
      return;
    }
    router.push(`/workspace/write/${program.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <GuestBanner />

      <header className="sticky top-8 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} aria-label="返回">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-medium text-foreground">项目详情</p>
          </div>
          <Button size="sm" onClick={handleWriteClick}>
            <FileText className="mr-1.5 h-4 w-4" />
            写文书
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-5 rounded-xl border border-border/80 bg-card/95 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <SchoolLogoMark school={school} size="lg" />
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{program.nameEn}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {school.nameEn} · {school.country}
                </p>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-muted/[0.14] p-3">
                <p className="text-xs text-muted-foreground">学制</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{program.duration}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/[0.14] p-3">
                <p className="text-xs text-muted-foreground">类型</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{program.degree}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/[0.14] p-3">
                <p className="text-xs text-muted-foreground">QS排名</p>
                <p className="mt-1 text-lg font-semibold text-foreground">#{school.ranking}</p>
              </div>
            </div>

            <Tabs defaultValue="basic" className="gap-4">
              <TabsList className="h-10 w-full justify-start">
                <TabsTrigger value="basic" className="px-4 text-sm">
                  基本信息
                </TabsTrigger>
                <TabsTrigger value="requirements" className="px-4 text-sm">
                  申请要求
                </TabsTrigger>
                <TabsTrigger value="detail" className="px-4 text-sm">
                  项目详情
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="rounded-lg border border-border/70">
                <div className="divide-y divide-border/70 text-sm">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">学制</span>
                    <span className="font-medium text-foreground">{program.duration}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">类型</span>
                    <span className="font-medium text-foreground">{program.degree}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">院系</span>
                    <span className="font-medium text-foreground">{program.department}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">QS 排名</span>
                    <span className="font-medium text-foreground">{school.ranking}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">项目学费</span>
                    <span className="font-medium text-foreground">{program.tuition}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="rounded-lg border border-border/70 p-4">
                <ul className="space-y-2">
                  {program.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="detail" className="space-y-4 rounded-lg border border-border/70 p-4">
                <div>
                  <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">项目简介</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{program.description}</p>
                </div>
                {program.curriculumNote && (
                  <div>
                    <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">课程与培养方向</p>
                    <p className="text-sm leading-relaxed text-foreground/90">{program.curriculumNote}</p>
                  </div>
                )}
                {(school.campusStyle || school.locationAndSetting || school.studentLife) && (
                  <div className="border-t border-border/70 pt-4">
                    <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">院校介绍</p>
                    <SchoolRichInfo school={school} className="text-sm" />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-xl border border-border/80 bg-card/95 p-4">
              <div className="space-y-2">
                <Button className="w-full" onClick={toggleApply}>
                  <Bookmark className="mr-1.5 h-4 w-4" />
                  {isAdded ? "已在申请单（点击移除）" : "申请该项目"}
                </Button>
                <Button variant="outline" className="w-full" onClick={toggleFavorite}>
                  {isFavorite ? (
                    <BookmarkCheck className="mr-1.5 h-4 w-4" />
                  ) : (
                    <Star className="mr-1.5 h-4 w-4" />
                  )}
                  {isFavorite ? "已加入最爱" : "添加到最爱"}
                </Button>
              </div>
            </section>

            <section className="rounded-xl border border-border/80 bg-card/95 p-4">
              <p className="text-xs text-muted-foreground">项目学费</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{program.tuition}</p>
              {tuitionCny && <p className="mt-1 text-xs text-muted-foreground">{tuitionCny}</p>}
            </section>

            <section className="space-y-3 rounded-xl border border-border/80 bg-card/95 p-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{program.duration}</span>
                <Badge variant="secondary" className="ml-auto">{program.degree}</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                <span>QS #{school.ranking}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{school.city} · {school.country}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>申请截止 {formatDate(program.deadline)}</span>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Dialog open={writeChoiceOpen} onOpenChange={setWriteChoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>检测到已有文书草稿</DialogTitle>
            <DialogDescription>该项目之前已生成过文书。请选择打开历史版本，或清空并创建新的草稿。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setWriteChoiceOpen(false);
                router.push(`/workspace/write/${program.id}`);
              }}
            >
              打开之前的文书
            </Button>
            <Button
              onClick={() => {
                clearProgramDrafts(program.id);
                setWriteChoiceOpen(false);
                router.push(`/workspace/write/${program.id}`);
              }}
            >
              创建新的
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
