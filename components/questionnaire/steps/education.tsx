"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Education } from "@/lib/types";
import { SchoolNameSearch } from "@/components/questionnaire/school-name-search";
import { SchoolLogoMark } from "@/components/match/school-logo-mark";
import { faviconUrlForSchoolLabel } from "@/lib/school-favicon";

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const emptyEducation: Education = {
  school: "",
  degree: "",
  major: "",
  gpa: "",
  startDate: "",
  endDate: "",
  achievements: "",
};

export function EducationForm({ data, onChange }: EducationFormProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(data.length === 0 ? null : 0);

  const addEducation = () => {
    onChange([...data, { ...emptyEducation }]);
    setExpandedIndex(data.length);
  };

  const removeEducation = (index: number) => {
    if (!confirm("确认删除这段教育背景吗？")) {
      return;
    }
    onChange(data.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = data.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    onChange(updated);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">教育背景</h2>
        </div>
        <button
          onClick={addEducation}
          className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          + 添加教育背景
        </button>
      </div>

      {data.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            还没有添加教育背景，点击「添加教育背景」开始填写
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((edu, index) => (
            <div
              key={index}
              className="border-b border-border pb-6 last:border-b-0"
            >
              {/* Collapsed Header */}
              <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <SchoolLogoMark
                    logoUrl={edu.school ? faviconUrlForSchoolLabel(edu.school) : undefined}
                    label={edu.school || "校"}
                    size="md"
                    rounded="full"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {edu.school || "未填写学校"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[edu.degree, edu.major].filter(Boolean).join(" · ") || "点击展开填写"}
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
                      removeEducation(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {expandedIndex === index ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Form */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  expandedIndex === index ? "max-h-[1000px] opacity-100 mt-8" : "max-h-0 opacity-0"
                )}
              >
                {/* Row 1 */}
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-3 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      学校名称 *
                    </label>
                    <SchoolNameSearch
                      value={edu.school}
                      onChange={(v) => updateEducation(index, "school", v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      学位 *
                    </label>
                    <div className="border-b border-border pb-2">
                      <Select
                        value={edu.degree}
                        onValueChange={(value) => updateEducation(index, "degree", value)}
                      >
                        <SelectTrigger className="w-full border-0 bg-transparent p-0 text-base shadow-none focus:ring-0 h-auto">
                          <SelectValue placeholder="请选择学位" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="本科">本科</SelectItem>
                          <SelectItem value="硕士">硕士</SelectItem>
                          <SelectItem value="博士">博士</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      专业 *
                    </label>
                    <div className="border-b border-border pb-2">
                      <input
                        type="text"
                        placeholder="如：计算机科学与技术"
                        value={edu.major}
                        onChange={(e) => updateEducation(index, "major", e.target.value)}
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-3 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      成绩 / 绩点
                    </label>
                    <div className="border-b border-border pb-2">
                      <input
                        type="text"
                        placeholder="如 3.8/4.0、5 分制 4.2、百分制 88、均分 85"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      入学时间
                    </label>
                    <div className="border-b border-border pb-2">
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      毕业时间
                    </label>
                    <div className="border-b border-border pb-2">
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Achievements */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    学术成就（可选）
                  </label>
                  <div className="border-b border-border pb-2">
                    <textarea
                      placeholder="如：院长荣誉名单、奖学金等"
                      value={edu.achievements}
                      onChange={(e) => updateEducation(index, "achievements", e.target.value)}
                      rows={2}
                      className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none"
                    />
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
