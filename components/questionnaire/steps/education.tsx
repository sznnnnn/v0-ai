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
import { Plus, Trash2, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Education } from "@/lib/types";

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const emptyEducation: Education = {
  school: "",
  degree: "",
  major: "",
  gpa: "",
  gpaScale: "",
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">教育背景</h2>
        </div>
        <button
          onClick={addEducation}
          className="text-sm font-semibold uppercase tracking-wider text-teal-600 hover:text-teal-700 transition-colors"
        >
          + 添加教育背景
        </button>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground italic">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {edu.school || "未填写学校"}
                    </p>
                    <p className="text-sm text-muted-foreground">
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
                      学校名称 <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：北京大学"
                      value={edu.school}
                      onChange={(e) => updateEducation(index, "school", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      学位 <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={edu.degree}
                      onValueChange={(value) => updateEducation(index, "degree", value)}
                    >
                      <SelectTrigger className="w-full border-0 bg-transparent p-0 text-lg shadow-none focus:ring-0 h-auto">
                        <SelectValue placeholder="请选择学位" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="高中">高中</SelectItem>
                        <SelectItem value="本科">本科</SelectItem>
                        <SelectItem value="硕士">硕士</SelectItem>
                        <SelectItem value="博士">博士</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      专业 <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="如：计算机科学与技术"
                      value={edu.major}
                      onChange={(e) => updateEducation(index, "major", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid gap-8 md:grid-cols-3 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 border-b border-border pb-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        GPA
                      </label>
                      <input
                        type="text"
                        placeholder="3.8"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                        className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2 border-b border-border pb-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        满分
                      </label>
                      <Select
                        value={edu.gpaScale}
                        onValueChange={(value) => updateEducation(index, "gpaScale", value)}
                      >
                        <SelectTrigger className="w-full border-0 bg-transparent p-0 text-lg shadow-none focus:ring-0 h-auto">
                          <SelectValue placeholder="4.0" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4.0">4.0</SelectItem>
                          <SelectItem value="5.0">5.0</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      入学时间
                    </label>
                    <input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 border-b border-border pb-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      毕业时间
                    </label>
                    <input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                      className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Achievements */}
                <div className="space-y-2 border-b border-border pb-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    学术成就（可选）
                  </label>
                  <textarea
                    placeholder="如：院长荣誉名单、奖学金等"
                    value={edu.achievements}
                    onChange={(e) => updateEducation(index, "achievements", e.target.value)}
                    rows={2}
                    className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
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
