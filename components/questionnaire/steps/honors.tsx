"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Award, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Honor } from "@/lib/types";

interface HonorsFormProps {
  data: Honor[];
  onChange: (data: Honor[]) => void;
}

export function HonorsForm({ data, onChange }: HonorsFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addHonor = () => {
    const newHonor: Honor = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      issuer: "",
      date: "",
      description: "",
    };
    onChange([...data, newHonor]);
    setExpandedIndex(data.length);
  };

  const removeHonor = (index: number) => {
    if (!confirm("确认删除这个奖项吗？")) {
      return;
    }
    onChange(data.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const updateHonor = (index: number, field: keyof Honor, value: string) => {
    const updated = data.map((honor, i) =>
      i === index ? { ...honor, [field]: value } : honor
    );
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">荣誉奖项</h2>
        </div>
        <button
          onClick={addHonor}
          className="text-sm font-semibold uppercase tracking-wider text-teal-600 hover:text-teal-700 transition-colors"
        >
          + 添加奖项
        </button>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground italic">
            还没有添加荣誉奖项（可选），点击「添加奖项」开始填写
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((honor, index) => (
            <div
              key={honor.id}
              className="border-b border-border pb-6 last:border-b-0"
            >
              {/* Collapsed Header */}
              <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Award className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {honor.name || "未填写奖项名称"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {honor.issuer || "点击展开填写"}
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
                      removeHonor(index);
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
                  expandedIndex === index ? "max-h-[1000px] opacity-100 mt-6" : "max-h-0 opacity-0"
                )}
              >
                {/* Row 1 */}
                <div className="grid gap-8 md:grid-cols-3 mb-6">
                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      奖项名称
                    </label>
                    <input
                      type="text"
                      placeholder="如：国家奖学金"
                      value={honor.name}
                      onChange={(e) => updateHonor(index, "name", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      颁发机构
                    </label>
                    <input
                      type="text"
                      placeholder="如：教育部"
                      value={honor.issuer}
                      onChange={(e) => updateHonor(index, "issuer", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      获奖时间
                    </label>
                    <input
                      type="month"
                      value={honor.date}
                      onChange={(e) => updateHonor(index, "date", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 border-b border-border pb-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    描述（可选）
                  </label>
                  <textarea
                    placeholder="简要说明这个奖项的含义或获奖原因"
                    value={honor.description}
                    onChange={(e) => updateHonor(index, "description", e.target.value)}
                    rows={2}
                    className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
