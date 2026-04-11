"use client";

import { MessageSquareText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PersonalInfo } from "@/lib/types";

interface ExtensionQuestionsFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export function ExtensionQuestionsForm({ data, onChange }: ExtensionQuestionsFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <MessageSquareText className="h-5 w-5 text-muted-foreground" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-foreground">拓展问题</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">选填，便于后续匹配与文书参考</p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
        <p className="text-xs font-medium text-foreground/85">申请偏好</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-muted-foreground">未来规划</label>
            <Textarea
              placeholder="如就业方向、读博、回国、间隔年等"
              value={data.futurePlan}
              onChange={(e) => handleChange("futurePlan", e.target.value)}
              rows={3}
              className="min-h-[5rem] resize-y border-border/80 bg-transparent text-sm shadow-none focus-visible:ring-1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">经费来源意向</label>
            <Select
              value={data.fundingIntent || "unset"}
              onValueChange={(v) =>
                handleChange("fundingIntent", v === "unset" ? "" : (v as PersonalInfo["fundingIntent"]))
              }
            >
              <SelectTrigger className="h-10 w-full rounded-md border border-border/80 bg-transparent px-3 text-sm shadow-none focus:ring-1">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">暂不选择</SelectItem>
                <SelectItem value="self">自费为主</SelectItem>
                <SelectItem value="scholarship">希望争取奖学金</SelectItem>
                <SelectItem value="mixed">自费与奖学金结合</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">授课语言偏好</label>
            <Select
              value={data.teachingLanguagePref || "unset"}
              onValueChange={(v) =>
                handleChange(
                  "teachingLanguagePref",
                  v === "unset" ? "" : (v as PersonalInfo["teachingLanguagePref"])
                )
              }
            >
              <SelectTrigger className="h-10 w-full rounded-md border border-border/80 bg-transparent px-3 text-sm shadow-none focus:ring-1">
                <SelectValue placeholder="选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">暂不选择</SelectItem>
                <SelectItem value="english">英文授课</SelectItem>
                <SelectItem value="bilingual_ok">可接受部分双语</SelectItem>
                <SelectItem value="any">不限</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
        <p className="text-xs font-medium text-foreground/85">动机与补充</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">研究兴趣补充</label>
            <Textarea
              placeholder="如关注 NLP、因果推断、金融科技等"
              value={data.researchInterestNote}
              onChange={(e) => handleChange("researchInterestNote", e.target.value)}
              rows={4}
              className="min-h-[6rem] resize-y border-border/80 bg-transparent text-sm shadow-none focus-visible:ring-1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">留学动机 / 一句话目标</label>
            <Textarea
              placeholder="如希望转轨数据岗、积累海外科研经历等"
              value={data.motivationNote}
              onChange={(e) => handleChange("motivationNote", e.target.value)}
              rows={4}
              className="min-h-[6rem] resize-y border-border/80 bg-transparent text-sm shadow-none focus-visible:ring-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">其他申请补充（自由填写）</label>
          <Textarea
            placeholder="可填写任何与申请相关的信息，如特殊情况说明、选校偏好、时间安排、补充经历等"
            value={data.otherApplicationNotes}
            onChange={(e) => handleChange("otherApplicationNotes", e.target.value)}
            rows={4}
            className="min-h-[7rem] resize-y border-border/80 bg-transparent text-sm shadow-none focus-visible:ring-1"
          />
        </div>
      </div>
    </div>
  );
}
