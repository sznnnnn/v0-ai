"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  GraduationCap,
  Building2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { useMatchResult } from "@/hooks/use-questionnaire";
import type { Program, School } from "@/lib/types";

interface ApplicationItem {
  program: Program;
  school: School;
  status: "todo" | "in-progress" | "submitted" | "accepted" | "rejected";
  notes?: string;
}

const statusConfig = {
  todo: { label: "待申请", color: "bg-gray-100 text-gray-700" },
  "in-progress": { label: "准备中", color: "bg-blue-100 text-blue-700" },
  submitted: { label: "已提交", color: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "已录取", color: "bg-green-100 text-green-700" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-700" },
};

export default function WorkspacePage() {
  const { result } = useMatchResult();
  const [addedProgramIds, setAddedProgramIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<Record<string, ApplicationItem["status"]>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // 从本地存储加载数据
  useEffect(() => {
    const storedPrograms = localStorage.getItem("edumatch_added_programs");
    if (storedPrograms) {
      setAddedProgramIds(JSON.parse(storedPrograms));
    }
    
    const storedStatus = localStorage.getItem("edumatch_application_status");
    if (storedStatus) {
      setApplications(JSON.parse(storedStatus));
    }
  }, []);
  
  // 获取已添加的项目详情
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
  
  // 可添加的项目（未添加的）
  const availablePrograms = useMemo(() => {
    if (!result) return [];
    return result.programs
      .filter((p) => !addedProgramIds.includes(p.id))
      .map((program) => {
        const school = result.schools.find((s) => s.id === program.schoolId);
        if (!school) return null;
        return { program, school };
      })
      .filter(Boolean) as { program: Program; school: School }[];
  }, [result, addedProgramIds]);
  
  // 筛选后的项目
  const filteredPrograms = useMemo(() => {
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
  
  // 按学校分组
  const groupedBySchool = useMemo(() => {
    const groups: Record<string, { school: School; programs: Program[] }> = {};
    filteredPrograms.forEach(({ program, school }) => {
      if (!groups[school.id]) {
        groups[school.id] = { school, programs: [] };
      }
      groups[school.id].programs.push(program);
    });
    return Object.values(groups);
  }, [filteredPrograms]);
  
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
  
  const addProgram = (programId: string) => {
    const updated = [...addedProgramIds, programId];
    setAddedProgramIds(updated);
    localStorage.setItem("edumatch_added_programs", JSON.stringify(updated));
  };
  
  // 统计数据
  const stats = useMemo(() => {
    const statusCounts = {
      todo: 0,
      "in-progress": 0,
      submitted: 0,
      accepted: 0,
      rejected: 0,
    };
    addedProgramIds.forEach((id) => {
      const status = applications[id] || "todo";
      statusCounts[status]++;
    });
    return statusCounts;
  }, [addedProgramIds, applications]);
  
  // 即将截止的项目
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return addedPrograms
      .filter(({ program }) => {
        const deadline = new Date(program.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 30;
      })
      .sort((a, b) => new Date(a.program.deadline).getTime() - new Date(b.program.deadline).getTime())
      .slice(0, 3);
  }, [addedPrograms]);
  
  return (
    <div className="min-h-screen bg-background">
      <GuestBanner />
      
      {/* Header */}
      <header className="sticky top-8 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground hidden sm:inline">EduMatch</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">工作台</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/match">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                查看匹配
              </Button>
            </Link>
            <Link href="/questionnaire">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                编辑背景
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* 统计概览 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">申请工作台</h1>
          <p className="text-muted-foreground">管理您的申请项目，跟踪申请进度</p>
          
          {/* 状态统计 */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">待申请</p>
              <p className="text-2xl font-bold text-foreground">{stats.todo}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-600">准备中</p>
              <p className="text-2xl font-bold text-blue-700">{stats["in-progress"]}</p>
            </div>
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-600">已提交</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.submitted}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-600">已录取</p>
              <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 col-span-2 sm:col-span-1">
              <p className="text-sm text-red-600">已拒绝</p>
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            </div>
          </div>
        </div>
        
        {/* 即将截止提醒 */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-8 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-700">即将截止</h3>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.map(({ program, school }) => {
                const deadline = new Date(program.deadline);
                const daysUntil = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={program.id} className="flex items-center justify-between text-sm">
                    <span className="text-orange-800">
                      {school.name} - {program.name}
                    </span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                      {daysUntil} 天后截止
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* 搜索和添加 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索学校或项目..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                添加项目
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加申请项目</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {availablePrograms.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">没有更多可添加的项目</p>
                    <Link href="/match">
                      <Button variant="outline" className="mt-4">
                        查看更多匹配结果
                      </Button>
                    </Link>
                  </div>
                ) : (
                  availablePrograms.map(({ program, school }) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{program.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {school.name} · {program.degree}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          addProgram(program.id);
                          setIsAddDialogOpen(false);
                        }}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        添加
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* 项目列表 */}
        {addedPrograms.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
            <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">还没有添加申请项目</h2>
            <p className="text-muted-foreground mb-6">
              从 AI 匹配结果中添加项目，开始管理您的申请
            </p>
            <Link href="/match">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                查看 AI 匹配结果
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedBySchool.map(({ school, programs }) => (
              <div key={school.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* 学校标题 */}
                <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">{school.nameEn}</p>
                  </div>
                  <Badge variant="outline">{programs.length} 个项目</Badge>
                </div>
                
                {/* 项目列表 */}
                <div className="divide-y divide-border">
                  {programs.map((program) => {
                    const status = applications[program.id] || "todo";
                    const statusInfo = statusConfig[status];
                    
                    return (
                      <div
                        key={program.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{program.name}</h4>
                            <Badge variant="outline" className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>{program.degree}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {program.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              截止 {program.deadline}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                更新状态
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {Object.entries(statusConfig).map(([key, value]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => updateStatus(program.id, key as ApplicationItem["status"])}
                                >
                                  <span className={`mr-2 h-2 w-2 rounded-full ${value.color.split(" ")[0]}`} />
                                  {value.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-destructive" onClick={() => removeProgram(program.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                移除项目
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
