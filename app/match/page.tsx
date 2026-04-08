"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Filter,
  GraduationCap,
  Building2,
  ChevronRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { SchoolCard } from "@/components/match/school-card";
import { ProgramCard } from "@/components/match/program-card";
import { useQuestionnaire, useMatchResult } from "@/hooks/use-questionnaire";
import { generateMatchResult } from "@/lib/mock-match";
import type { School, Program } from "@/lib/types";

type CategoryFilter = "all" | "reach" | "match" | "safety";

export default function MatchPage() {
  const router = useRouter();
  const { data: questionnaireData, isLoaded: isQuestionnaireLoaded, canGenerateMatch } = useQuestionnaire();
  const { result, isLoaded: isResultLoaded, saveResult } = useMatchResult();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [addedPrograms, setAddedPrograms] = useState<string[]>([]);
  
  // 生成匹配结果
  useEffect(() => {
    if (isQuestionnaireLoaded && isResultLoaded && !result && canGenerateMatch()) {
      setIsGenerating(true);
      // 模拟 AI 生成延迟
      setTimeout(() => {
        const newResult = generateMatchResult(questionnaireData);
        saveResult(newResult);
        setIsGenerating(false);
      }, 2000);
    }
  }, [isQuestionnaireLoaded, isResultLoaded, result, canGenerateMatch, questionnaireData, saveResult]);
  
  // 从本地存储加载已添加的项目
  useEffect(() => {
    const stored = localStorage.getItem("edumatch_added_programs");
    if (stored) {
      setAddedPrograms(JSON.parse(stored));
    }
  }, []);
  
  const handleAddProgram = (programId: string) => {
    const updated = [...addedPrograms, programId];
    setAddedPrograms(updated);
    localStorage.setItem("edumatch_added_programs", JSON.stringify(updated));
  };
  
  const handleRemoveProgram = (programId: string) => {
    const updated = addedPrograms.filter((id) => id !== programId);
    setAddedPrograms(updated);
    localStorage.setItem("edumatch_added_programs", JSON.stringify(updated));
  };
  
  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newResult = generateMatchResult(questionnaireData);
      saveResult(newResult);
      setIsGenerating(false);
    }, 2000);
  };
  
  // 筛选后的学校和项目
  const filteredSchools = useMemo(() => {
    if (!result) return [];
    if (categoryFilter === "all") return result.schools;
    return result.schools.filter((s) => s.category === categoryFilter);
  }, [result, categoryFilter]);
  
  const filteredPrograms = useMemo(() => {
    if (!result) return [];
    let programs = result.programs;
    
    if (categoryFilter !== "all") {
      programs = programs.filter((p) => p.category === categoryFilter);
    }
    
    if (selectedSchool) {
      programs = programs.filter((p) => p.schoolId === selectedSchool.id);
    }
    
    return programs.sort((a, b) => b.matchScore - a.matchScore);
  }, [result, categoryFilter, selectedSchool]);
  
  // 统计数据
  const stats = useMemo(() => {
    if (!result) return { reach: 0, match: 0, safety: 0, total: 0 };
    return {
      reach: result.schools.filter((s) => s.category === "reach").length,
      match: result.schools.filter((s) => s.category === "match").length,
      safety: result.schools.filter((s) => s.category === "safety").length,
      total: result.schools.length,
    };
  }, [result]);
  
  if (!isQuestionnaireLoaded || !isResultLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  if (!canGenerateMatch()) {
    return (
      <div className="min-h-screen bg-background">
        <GuestBanner />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">请先完善基本信息</h1>
          <p className="text-muted-foreground text-center mb-6">
            完成个人信息和教育背景后，即可生成 AI 智能匹配结果
          </p>
          <Link href="/questionnaire">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回填写问卷
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background">
        <GuestBanner />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="relative mb-8">
            <div className="h-24 w-24 rounded-full border-4 border-primary/20 animate-pulse" />
            <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-primary animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">AI 正在分析您的背景</h1>
          <p className="text-muted-foreground text-center">
            正在匹配最适合您的学校和项目...
          </p>
        </div>
      </div>
    );
  }
  
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
            <span className="font-medium text-foreground">匹配结果</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/questionnaire">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                更新背景
              </Button>
            </Link>
            <Link href="/workspace">
              <Button size="sm">
                进入工作台
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* 统计概览 */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                为您匹配了 {result?.schools.length || 0} 所学校
              </h1>
              <p className="text-muted-foreground mt-1">
                共 {result?.programs.length || 0} 个项目，已添加 {addedPrograms.length} 个到申请单
              </p>
            </div>
            
            <Button variant="outline" onClick={handleRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              重新匹配
            </Button>
          </div>
          
          {/* 分类统计 */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-orange-600">冲刺校</p>
              <p className="text-2xl font-bold text-orange-700">{stats.reach}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-600">主申校</p>
              <p className="text-2xl font-bold text-blue-700">{stats.match}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-600">保底校</p>
              <p className="text-2xl font-bold text-green-700">{stats.safety}</p>
            </div>
          </div>
        </div>
        
        {/* 筛选 */}
        <div className="mb-6">
          <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="reach">冲刺</TabsTrigger>
              <TabsTrigger value="match">主申</TabsTrigger>
              <TabsTrigger value="safety">保底</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* 主内容区 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 学校列表 */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">匹配学校</h2>
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <button
                  onClick={() => setSelectedSchool(null)}
                  className={`w-full text-left rounded-lg border p-3 transition-all ${
                    !selectedSchool
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-foreground">全部学校</p>
                  <p className="text-sm text-muted-foreground">
                    {filteredPrograms.length} 个项目
                  </p>
                </button>
                
                {filteredSchools.map((school) => {
                  const programCount = result?.programs.filter(
                    (p) => p.schoolId === school.id
                  ).length || 0;
                  
                  return (
                    <SchoolCard
                      key={school.id}
                      school={school}
                      programCount={programCount}
                      onClick={() => setSelectedSchool(school)}
                      isSelected={selectedSchool?.id === school.id}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* 项目列表 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">
                  {selectedSchool ? selectedSchool.name : "全部项目"}
                </h2>
                <Badge variant="secondary">{filteredPrograms.length}</Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredPrograms.map((program) => {
                const school = result?.schools.find((s) => s.id === program.schoolId);
                if (!school) return null;
                
                return (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    school={school}
                    isAdded={addedPrograms.includes(program.id)}
                    onAdd={() => handleAddProgram(program.id)}
                    onRemove={() => handleRemoveProgram(program.id)}
                  />
                );
              })}
              
              {filteredPrograms.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">暂无匹配项目</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 底部操作栏 */}
        {addedPrograms.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur p-4 z-50">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                已添加 <span className="font-semibold text-foreground">{addedPrograms.length}</span> 个项目到申请单
              </p>
              <Link href="/workspace">
                <Button>
                  进入工作台管理申请
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
