"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Skill } from "@/lib/types";

interface SkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const skillCategories = [
  { value: "technical", label: "技术技能" },
  { value: "language", label: "语言能力" },
  { value: "soft", label: "软技能" },
  { value: "other", label: "其他" },
];

const skillLevels = [
  { value: "beginner", label: "入门" },
  { value: "intermediate", label: "熟练" },
  { value: "advanced", label: "精通" },
  { value: "expert", label: "专家" },
];

const suggestedSkills = {
  technical: ["Python", "Java", "JavaScript", "SQL", "Excel", "MATLAB", "R", "C++", "机器学习", "数据分析"],
  language: ["英语", "日语", "德语", "法语", "西班牙语", "韩语"],
  soft: ["领导力", "团队协作", "沟通能力", "项目管理", "演讲能力", "批判性思维"],
  other: ["摄影", "视频剪辑", "设计", "写作"],
};

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    category: "technical",
    level: "intermediate",
  });

  const addSkill = () => {
    if (!newSkill.name) return;
    
    const skill: Skill = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSkill.name,
      level: (newSkill.level as Skill["level"]) || "intermediate",
      category: (newSkill.category as Skill["category"]) || "technical",
    };
    onChange([...data, skill]);
    setNewSkill({ ...newSkill, name: "" });
  };

  const addSuggestedSkill = (name: string, category: Skill["category"]) => {
    if (data.some((s) => s.name === name)) return;
    
    const skill: Skill = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      level: "intermediate",
      category,
    };
    onChange([...data, skill]);
  };

  const removeSkill = (id: string) => {
    onChange(data.filter((s) => s.id !== id));
  };

  const updateSkillLevel = (id: string, level: Skill["level"]) => {
    onChange(data.map((s) => (s.id === id ? { ...s, level } : s)));
  };

  const groupedSkills = data.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">技能</h2>
        <p className="text-muted-foreground">
          添加您掌握的技能，包括技术能力、语言能力等
        </p>
      </div>

      {/* 添加新技能 */}
      <div className="rounded-lg border border-border p-4 space-y-4">
        <p className="font-medium text-foreground">添加技能</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="技能名称，如：Python"
              value={newSkill.name || ""}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
          </div>
          <Select
            value={newSkill.category}
            onValueChange={(value) => setNewSkill({ ...newSkill, category: value as Skill["category"] })}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={newSkill.level}
            onValueChange={(value) => setNewSkill({ ...newSkill, level: value as Skill["level"] })}
          >
            <SelectTrigger className="w-full sm:w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addSkill} disabled={!newSkill.name}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 推荐技能 */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">快速添加常见技能</p>
        {Object.entries(suggestedSkills).map(([category, skills]) => (
          <div key={category} className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {skillCategories.find((c) => c.value === category)?.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const isAdded = data.some((s) => s.name === skill);
                return (
                  <Badge
                    key={skill}
                    variant={isAdded ? "default" : "outline"}
                    className={!isAdded ? "cursor-pointer hover:bg-primary/10" : ""}
                    onClick={() => !isAdded && addSuggestedSkill(skill, category as Skill["category"])}
                  >
                    {isAdded ? skill : `+ ${skill}`}
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 已添加的技能 */}
      {data.length > 0 && (
        <div className="space-y-4">
          <p className="font-medium text-foreground">已添加的技能</p>
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {skillCategories.find((c) => c.value === category)?.label}
              </p>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={skill.level}
                        onValueChange={(value) => updateSkillLevel(skill.id, value as Skill["level"])}
                      >
                        <SelectTrigger className="h-8 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSkill(skill.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
