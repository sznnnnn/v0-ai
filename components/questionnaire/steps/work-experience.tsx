"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Briefcase, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkExperience } from "@/lib/types";

interface WorkExperienceFormProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

const starTips = {
  situation: "描述背景：当时的情况是什么？公司/团队面临什么挑战？",
  task: "说明任务：你负责什么？目标是什么？",
  action: "阐述行动：你具体做了什么？采取了哪些步骤？",
  result: "展示结果：取得了什么成果？用数据量化（如提升30%效率）",
};

export function WorkExperienceForm({ data, onChange }: WorkExperienceFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Math.random().toString(36).substr(2, 9),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      situation: "",
      task: "",
      action: "",
      result: "",
    };
    onChange([...data, newExp]);
    setExpandedIndex(data.length);
  };

  const removeExperience = (index: number) => {
    if (!confirm("确认删除这段实习/工作经历吗？")) {
      return;
    }
    onChange(data.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    const updated = data.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">实习/工作经历</h2>
        </div>
        <button
          onClick={addExperience}
          className="text-sm font-semibold uppercase tracking-wider text-teal-600 hover:text-teal-700 transition-colors"
        >
          + 添加经历
        </button>
      </div>

      {/* AI Tip */}
      <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
        <Sparkles className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-teal-900">AI 引导：STAR 法则</p>
          <p className="text-sm text-teal-700 mt-1">
            STAR 法则能让你的经历描述更有说服力：
            <span className="font-medium"> S</span>ituation（情境）+ 
            <span className="font-medium"> T</span>ask（任务）+ 
            <span className="font-medium"> A</span>ction（行动）+ 
            <span className="font-medium"> R</span>esult（结果）
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground italic">
            还没有添加工作经历（可选），点击「添加经历」开始填写
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((exp, index) => (
            <div
              key={exp.id}
              className="border-b border-border pb-6 last:border-b-0"
            >
              {/* Collapsed Header */}
              <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {exp.company || "未填写公司"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exp.position || "点击展开填写"}
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
                      removeExperience(index);
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
                      公司名称
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      职位
                    </label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, "position", e.target.value)}
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
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="border-b border-border pb-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        结束时间
                      </label>
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                        disabled={exp.isCurrent}
                        className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox
                        checked={exp.isCurrent}
                        onCheckedChange={(checked) =>
                          updateExperience(index, "isCurrent", !!checked)
                        }
                      />
                      目前在职
                    </label>
                  </div>
                </div>

                {/* STAR Method Section */}
                <div className="space-y-6 pt-6 border-t border-border">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    用 STAR 法则描述这段经历
                  </p>

                  {/* S - Situation */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-600 text-xs font-bold text-white">
                        S
                      </span>
                      情境 SITUATION
                    </label>
                    <div className="border-b border-border pb-2">
                      <textarea
                        placeholder={starTips.situation}
                        value={exp.situation}
                        onChange={(e) => updateExperience(index, "situation", e.target.value)}
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
                      任务 TASK
                    </label>
                    <div className="border-b border-border pb-2">
                      <textarea
                        placeholder={starTips.task}
                        value={exp.task}
                        onChange={(e) => updateExperience(index, "task", e.target.value)}
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
                      行动 ACTION
                    </label>
                    <div className="border-b border-border pb-2">
                      <textarea
                        placeholder={starTips.action}
                        value={exp.action}
                        onChange={(e) => updateExperience(index, "action", e.target.value)}
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
                      结果 RESULT
                    </label>
                    <div className="border-b border-border pb-2">
                      <textarea
                        placeholder={starTips.result}
                        value={exp.result}
                        onChange={(e) => updateExperience(index, "result", e.target.value)}
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
