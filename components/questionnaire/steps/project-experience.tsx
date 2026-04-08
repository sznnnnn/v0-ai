"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, FolderGit2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectExperience } from "@/lib/types";

interface ProjectExperienceFormProps {
  data: ProjectExperience[];
  onChange: (data: ProjectExperience[]) => void;
}

const starTips = {
  situation: "项目背景：这个项目是为了解决什么问题？面向什么用户？",
  task: "你的角色：你在项目中担任什么角色？负责哪些部分？",
  action: "具体工作：你使用了什么技术/方法？如何完成任务？",
  result: "项目成果：项目最终效果如何？有什么量化数据或反馈？",
};

export function ProjectExperienceForm({ data, onChange }: ProjectExperienceFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addProject = () => {
    const newProject: ProjectExperience = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      role: "",
      startDate: "",
      endDate: "",
      situation: "",
      task: "",
      action: "",
      result: "",
    };
    onChange([...data, newProject]);
    setExpandedIndex(data.length);
  };

  const removeProject = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const updateProject = (index: number, field: keyof ProjectExperience, value: string) => {
    const updated = data.map((proj, i) =>
      i === index ? { ...proj, [field]: value } : proj
    );
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderGit2 className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">项目经历</h2>
        </div>
        <button
          onClick={addProject}
          className="text-sm font-semibold uppercase tracking-wider text-teal-600 hover:text-teal-700 transition-colors"
        >
          + 添加项目
        </button>
      </div>

      {/* AI Tip */}
      <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
        <Sparkles className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-teal-900">AI 引导：用 STAR 法则展示项目</p>
          <p className="text-sm text-teal-700 mt-1">
            好的项目描述能让招生官快速了解你的能力。请详细描述你在项目中的具体贡献和成果。
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground italic">
            还没有添加项目经历（可选），点击「添加项目」开始填写
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((proj, index) => (
            <div
              key={proj.id}
              className="border-b border-border pb-6 last:border-b-0"
            >
              {/* Collapsed Header */}
              <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {proj.name || "未填写项目名称"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {proj.role || "点击展开填写"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProject(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {expandedIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Form */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  expandedIndex === index ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
                )}
              >
                {/* Row 1 */}
                <div className="grid gap-8 md:grid-cols-2 mb-6">
                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      项目名称
                    </label>
                    <input
                      type="text"
                      placeholder="如：智能推荐系统"
                      value={proj.name}
                      onChange={(e) => updateProject(index, "name", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      你的角色
                    </label>
                    <input
                      type="text"
                      placeholder="如：项目负责人 / 前端开发"
                      value={proj.role}
                      onChange={(e) => updateProject(index, "role", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Dates */}
                <div className="grid gap-8 md:grid-cols-2 mb-8">
                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      开始时间
                    </label>
                    <input
                      type="month"
                      value={proj.startDate}
                      onChange={(e) => updateProject(index, "startDate", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      结束时间
                    </label>
                    <input
                      type="month"
                      value={proj.endDate}
                      onChange={(e) => updateProject(index, "endDate", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* STAR Method Section */}
                <div className="space-y-6 pt-6 border-t border-border">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    用 STAR 法则描述这个项目
                  </p>

                  {/* S - Situation */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-xs font-bold text-white">
                        S
                      </span>
                      项目背景 SITUATION
                    </label>
                    <div className="border-b border-border pb-2">
                      <textarea
                        placeholder={starTips.situation}
                        value={proj.situation}
                        onChange={(e) => updateProject(index, "situation", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* T - Task */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-xs font-bold text-white">
                        T
                      </span>
                      你的角色 TASK
                    </label>
                    <div className="border-b border-border pb-2">
                      <textarea
                        placeholder={starTips.task}
                        value={proj.task}
                        onChange={(e) => updateProject(index, "task", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* A - Action */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-xs font-bold text-white">
                        A
                      </span>
                      具体工作 ACTION
                    </label>
                    <div className="border-b border-border pb-2">
                      <textarea
                        placeholder={starTips.action}
                        value={proj.action}
                        onChange={(e) => updateProject(index, "action", e.target.value)}
                        rows={3}
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* R - Result */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-xs font-bold text-white">
                        R
                      </span>
                      项目成果 RESULT
                    </label>
                    <div className="border-b border-border pb-2">
                      <textarea
                        placeholder={starTips.result}
                        value={proj.result}
                        onChange={(e) => updateProject(index, "result", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
