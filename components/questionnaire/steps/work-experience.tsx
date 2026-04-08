"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Briefcase, Sparkles } from "lucide-react";
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">实习/工作经历</h2>
        <p className="text-muted-foreground">
          添加您的实习或工作经历，我们将引导您用 STAR 法则撰写
        </p>
      </div>

      {/* STAR 法则说明 */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-foreground">AI 引导：STAR 法则</p>
            <p className="text-sm text-muted-foreground mt-1">
              STAR 法则能让你的经历描述更有说服力：
              <span className="font-medium text-foreground"> S</span>ituation（情境）+ 
              <span className="font-medium text-foreground"> T</span>ask（任务）+ 
              <span className="font-medium text-foreground"> A</span>ction（行动）+ 
              <span className="font-medium text-foreground"> R</span>esult（结果）
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12">
          <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-center text-muted-foreground">
            还没有添加工作经历（可选）
          </p>
          <Button onClick={addExperience}>
            <Plus className="mr-2 h-4 w-4" />
            添加工作经历
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((exp, index) => (
            <div
              key={exp.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {exp.company || "未填写公司"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {exp.position || "未填写职位"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExperience(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedIndex === index && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>公司名称</Label>
                      <Input
                        placeholder="如：字节跳动"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>职位</Label>
                      <Input
                        placeholder="如：产品经理实习生"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, "position", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>开始时间</Label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>结束时间</Label>
                      <div className="space-y-2">
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                          disabled={exp.isCurrent}
                        />
                        <label className="flex items-center gap-2 text-sm">
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
                  </div>

                  {/* STAR 法则输入 */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      用 STAR 法则描述这段经历
                    </p>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                          S
                        </span>
                        情境 Situation
                      </Label>
                      <Textarea
                        placeholder={starTips.situation}
                        value={exp.situation}
                        onChange={(e) => updateExperience(index, "situation", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                          T
                        </span>
                        任务 Task
                      </Label>
                      <Textarea
                        placeholder={starTips.task}
                        value={exp.task}
                        onChange={(e) => updateExperience(index, "task", e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                          A
                        </span>
                        行动 Action
                      </Label>
                      <Textarea
                        placeholder={starTips.action}
                        value={exp.action}
                        onChange={(e) => updateExperience(index, "action", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
                          R
                        </span>
                        结果 Result
                      </Label>
                      <Textarea
                        placeholder={starTips.result}
                        value={exp.result}
                        onChange={(e) => updateExperience(index, "result", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addExperience}>
            <Plus className="mr-2 h-4 w-4" />
            添加更多工作经历
          </Button>
        </div>
      )}
    </div>
  );
}
