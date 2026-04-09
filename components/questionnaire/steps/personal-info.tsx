"use client";

import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { PersonalInfo } from "@/lib/types";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <User className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">基本信息</h2>
      </div>

      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            目标专业
          </label>
          <div className="border-b border-border pb-2 transition-colors focus-within:border-foreground/60">
            <Input
              type="text"
              placeholder="目标申请专业"
              value={data.intendedMajor}
              onChange={(e) => handleChange("intendedMajor", e.target.value)}
              className="h-auto border-0 bg-transparent px-0 py-0 text-base text-foreground shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            申请领域
          </label>
          <div className="border-b border-border pb-2 transition-colors focus-within:border-foreground/60">
            <Input
              type="text"
              placeholder="如 CS、数据科学、金融"
              value={data.intendedApplicationField}
              onChange={(e) => handleChange("intendedApplicationField", e.target.value)}
              className="h-auto border-0 bg-transparent px-0 py-0 text-base text-foreground shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            入学时间
          </label>
          <div className="border-b border-border pb-2 transition-colors focus-within:border-foreground/60">
            <Input
              type="text"
              placeholder="入学时间"
              value={data.targetSemester}
              onChange={(e) => handleChange("targetSemester", e.target.value)}
              className="h-auto border-0 bg-transparent px-0 py-0 text-base text-foreground shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            预算
          </label>
          <div className="border-b border-border pb-2 transition-colors focus-within:border-foreground/60">
            <Input
              type="text"
              placeholder="如 50万/年、$80k"
              value={data.budgetEstimate}
              onChange={(e) => handleChange("budgetEstimate", e.target.value)}
              className="h-auto border-0 bg-transparent px-0 py-0 text-base text-foreground shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            学制打算
          </label>
          <div className="border-b border-border pb-2 transition-colors focus-within:border-foreground/60">
            <Input
              type="text"
              placeholder="如 1年、2年、不限"
              value={data.plannedStudyDuration}
              onChange={(e) => handleChange("plannedStudyDuration", e.target.value)}
              className="h-auto border-0 bg-transparent px-0 py-0 text-base text-foreground shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
