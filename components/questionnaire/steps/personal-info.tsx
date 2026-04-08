"use client";

import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { PersonalInfo } from "@/lib/types";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const targetCountries = [
  { value: "us", label: "美国" },
  { value: "uk", label: "英国" },
  { value: "ca", label: "加拿大" },
  { value: "au", label: "澳大利亚" },
  { value: "sg", label: "新加坡" },
  { value: "hk", label: "中国香港" },
  { value: "de", label: "德国" },
  { value: "jp", label: "日本" },
];

const popularMajors = [
  "计算机科学",
  "数据科学",
  "人工智能",
  "金融",
  "商业分析",
  "市场营销",
  "电子工程",
  "机械工程",
  "建筑设计",
  "传媒",
  "教育",
  "心理学",
  "法律",
  "公共管理",
  "其他",
];

const semesters = [
  "2025 秋季",
  "2026 春季",
  "2026 秋季",
  "2027 春季",
  "2027 秋季",
];

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const toggleCountry = (country: string) => {
    const current = data.targetCountry || [];
    const updated = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    handleChange("targetCountry", updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-foreground" />
        <h2 className="text-2xl font-semibold text-foreground">个人基本信息</h2>
      </div>

      {/* Row 1: Name, Email, Phone */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-2 border-b border-border pb-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            姓名 <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="请输入您的姓名"
            value={data.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        <div className="space-y-2 border-b border-border pb-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            邮箱 <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>

        <div className="space-y-2 border-b border-border pb-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            手机号
          </label>
          <input
            type="tel"
            placeholder="+86 xxx xxxx xxxx"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Row 2: Nationality, Major, Degree */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-2 border-b border-border pb-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            国籍
          </label>
          <Select
            value={data.nationality}
            onValueChange={(value) => handleChange("nationality", value)}
          >
            <SelectTrigger className="w-full border-0 bg-transparent p-0 text-lg shadow-none focus:ring-0 h-auto">
              <SelectValue placeholder="请选择国籍" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cn">中国</SelectItem>
              <SelectItem value="other">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 border-b border-border pb-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            意向专业 <span className="text-destructive">*</span>
          </label>
          <Select
            value={data.intendedMajor}
            onValueChange={(value) => handleChange("intendedMajor", value)}
          >
            <SelectTrigger className="w-full border-0 bg-transparent p-0 text-lg shadow-none focus:ring-0 h-auto">
              <SelectValue placeholder="请选择意向专业" />
            </SelectTrigger>
            <SelectContent>
              {popularMajors.map((major) => (
                <SelectItem key={major} value={major}>
                  {major}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 border-b border-border pb-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            目标学位 <span className="text-destructive">*</span>
          </label>
          <Select
            value={data.targetDegree}
            onValueChange={(value) => handleChange("targetDegree", value)}
          >
            <SelectTrigger className="w-full border-0 bg-transparent p-0 text-lg shadow-none focus:ring-0 h-auto">
              <SelectValue placeholder="请选择目标学位" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bachelor">本科 Bachelor</SelectItem>
              <SelectItem value="master">硕士 Master</SelectItem>
              <SelectItem value="phd">博士 PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Target Semester */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-2 border-b border-border pb-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            目标入学时间 <span className="text-destructive">*</span>
          </label>
          <Select
            value={data.targetSemester}
            onValueChange={(value) => handleChange("targetSemester", value)}
          >
            <SelectTrigger className="w-full border-0 bg-transparent p-0 text-lg shadow-none focus:ring-0 h-auto">
              <SelectValue placeholder="请选择入学时间" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Target Countries Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            目标留学国家/地区 <span className="text-destructive">*</span>
          </label>
          {data.targetCountry?.length > 0 && (
            <span className="text-xs text-muted-foreground">
              已选 {data.targetCountry.length} 个
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {targetCountries.map((country) => (
            <label
              key={country.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <Checkbox
                checked={data.targetCountry?.includes(country.value)}
                onCheckedChange={() => toggleCountry(country.value)}
              />
              <span className="text-sm font-medium">{country.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
