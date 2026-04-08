"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StandardizedTest } from "@/lib/types";

interface StandardizedTestsFormProps {
  data: StandardizedTest;
  onChange: (data: StandardizedTest) => void;
}

export function StandardizedTestsForm({ data, onChange }: StandardizedTestsFormProps) {
  const [activeTab, setActiveTab] = useState("toefl");

  const updateToefl = (field: string, value: string) => {
    onChange({
      ...data,
      toefl: { ...data.toefl, [field]: value } as StandardizedTest["toefl"],
    });
  };

  const updateIelts = (field: string, value: string) => {
    onChange({
      ...data,
      ielts: { ...data.ielts, [field]: value } as StandardizedTest["ielts"],
    });
  };

  const updateGre = (field: string, value: string) => {
    onChange({
      ...data,
      gre: { ...data.gre, [field]: value } as StandardizedTest["gre"],
    });
  };

  const updateGmat = (field: string, value: string) => {
    onChange({
      ...data,
      gmat: { ...data.gmat, [field]: value } as StandardizedTest["gmat"],
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">标化成绩</h2>
        <p className="text-muted-foreground">
          请填写您的语言考试和研究生入学考试成绩（可选）
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="toefl">TOEFL</TabsTrigger>
          <TabsTrigger value="ielts">IELTS</TabsTrigger>
          <TabsTrigger value="gre">GRE</TabsTrigger>
          <TabsTrigger value="gmat">GMAT</TabsTrigger>
        </TabsList>

        <TabsContent value="toefl" className="mt-6">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">TOEFL iBT</h3>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>总分</Label>
                <Input
                  placeholder="120"
                  value={data.toefl?.total || ""}
                  onChange={(e) => updateToefl("total", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>阅读</Label>
                <Input
                  placeholder="30"
                  value={data.toefl?.reading || ""}
                  onChange={(e) => updateToefl("reading", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>听力</Label>
                <Input
                  placeholder="30"
                  value={data.toefl?.listening || ""}
                  onChange={(e) => updateToefl("listening", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>口语</Label>
                <Input
                  placeholder="30"
                  value={data.toefl?.speaking || ""}
                  onChange={(e) => updateToefl("speaking", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>写作</Label>
                <Input
                  placeholder="30"
                  value={data.toefl?.writing || ""}
                  onChange={(e) => updateToefl("writing", e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ielts" className="mt-6">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">IELTS</h3>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>总分</Label>
                <Input
                  placeholder="9.0"
                  value={data.ielts?.overall || ""}
                  onChange={(e) => updateIelts("overall", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>阅读</Label>
                <Input
                  placeholder="9.0"
                  value={data.ielts?.reading || ""}
                  onChange={(e) => updateIelts("reading", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>听力</Label>
                <Input
                  placeholder="9.0"
                  value={data.ielts?.listening || ""}
                  onChange={(e) => updateIelts("listening", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>口语</Label>
                <Input
                  placeholder="9.0"
                  value={data.ielts?.speaking || ""}
                  onChange={(e) => updateIelts("speaking", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>写作</Label>
                <Input
                  placeholder="9.0"
                  value={data.ielts?.writing || ""}
                  onChange={(e) => updateIelts("writing", e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gre" className="mt-6">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">GRE General</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Verbal</Label>
                <Input
                  placeholder="170"
                  value={data.gre?.verbal || ""}
                  onChange={(e) => updateGre("verbal", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantitative</Label>
                <Input
                  placeholder="170"
                  value={data.gre?.quantitative || ""}
                  onChange={(e) => updateGre("quantitative", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Analytical Writing</Label>
                <Input
                  placeholder="6.0"
                  value={data.gre?.analyticalWriting || ""}
                  onChange={(e) => updateGre("analyticalWriting", e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gmat" className="mt-6">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">GMAT</h3>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>总分</Label>
                <Input
                  placeholder="800"
                  value={data.gmat?.total || ""}
                  onChange={(e) => updateGmat("total", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Verbal</Label>
                <Input
                  placeholder="60"
                  value={data.gmat?.verbal || ""}
                  onChange={(e) => updateGmat("verbal", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantitative</Label>
                <Input
                  placeholder="60"
                  value={data.gmat?.quantitative || ""}
                  onChange={(e) => updateGmat("quantitative", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>IR</Label>
                <Input
                  placeholder="8"
                  value={data.gmat?.integratedReasoning || ""}
                  onChange={(e) => updateGmat("integratedReasoning", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>AWA</Label>
                <Input
                  placeholder="6.0"
                  value={data.gmat?.analyticalWriting || ""}
                  onChange={(e) => updateGmat("analyticalWriting", e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        提示：如果您还没有参加考试，可以跳过此步骤，之后再补充
      </p>
    </div>
  );
}
