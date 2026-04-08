"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Award } from "lucide-react";
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">荣誉奖项</h2>
        <p className="text-muted-foreground">
          添加您获得的奖项、荣誉、证书等
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12">
          <Award className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-center text-muted-foreground">
            还没有添加荣誉奖项（可选）
          </p>
          <Button onClick={addHonor}>
            <Plus className="mr-2 h-4 w-4" />
            添加荣誉奖项
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((honor, index) => (
            <div
              key={honor.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {honor.name || "未填写奖项名称"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {honor.issuer || "未填写颁发机构"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeHonor(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {expandedIndex === index && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>奖项名称</Label>
                      <Input
                        placeholder="如：国家奖学金"
                        value={honor.name}
                        onChange={(e) => updateHonor(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>颁发机构</Label>
                      <Input
                        placeholder="如：教育部"
                        value={honor.issuer}
                        onChange={(e) => updateHonor(index, "issuer", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>获奖时间</Label>
                      <Input
                        type="month"
                        value={honor.date}
                        onChange={(e) => updateHonor(index, "date", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>描述（可选）</Label>
                    <Textarea
                      placeholder="简要说明这个奖项的含义或获奖原因"
                      value={honor.description}
                      onChange={(e) => updateHonor(index, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addHonor}>
            <Plus className="mr-2 h-4 w-4" />
            添加更多荣誉奖项
          </Button>
        </div>
      )}
    </div>
  );
}
