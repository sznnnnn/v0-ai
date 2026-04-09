"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuestionnaire } from "@/hooks/use-questionnaire";
import type { QuestionnaireData } from "@/lib/types";

function ValueRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value?.trim() ? value : "未填"}</span>
    </div>
  );
}

export default function BackgroundPage() {
  const { data, isLoaded, saveData } = useQuestionnaire();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<QuestionnaireData | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    setDraft(data);
  }, [data, isLoaded]);

  const updatePersonalInfo = (field: keyof QuestionnaireData["personalInfo"], value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value,
        },
      };
    });
  };

  const updateProject = (index: number, field: "name" | "role", value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextProjects = prev.projects.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      return { ...prev, projects: nextProjects };
    });
  };

  const handleSave = () => {
    if (!draft) return;
    saveData({
      personalInfo: draft.personalInfo,
      projects: draft.projects,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(data);
    setIsEditing(false);
  };

  if (!isLoaded || !draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">背景信息</h1>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button size="sm" onClick={handleSave}>
                保存
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              编辑
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-border/80 bg-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <span className="text-muted-foreground">称呼</span>
                    <input
                      value={draft.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-foreground outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <span className="text-muted-foreground">专业</span>
                    <input
                      value={draft.personalInfo.intendedMajor}
                      onChange={(e) => updatePersonalInfo("intendedMajor", e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-foreground outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <span className="text-muted-foreground">领域</span>
                    <input
                      value={draft.personalInfo.intendedApplicationField}
                      onChange={(e) => updatePersonalInfo("intendedApplicationField", e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-foreground outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <span className="text-muted-foreground">入学</span>
                    <input
                      value={draft.personalInfo.targetSemester}
                      onChange={(e) => updatePersonalInfo("targetSemester", e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-foreground outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <span className="text-muted-foreground">预算</span>
                    <input
                      value={draft.personalInfo.budgetEstimate}
                      onChange={(e) => updatePersonalInfo("budgetEstimate", e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-foreground outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <span className="text-muted-foreground">学制</span>
                    <input
                      value={draft.personalInfo.plannedStudyDuration}
                      onChange={(e) => updatePersonalInfo("plannedStudyDuration", e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-foreground outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <ValueRow label="称呼" value={draft.personalInfo.fullName} />
                  <ValueRow label="专业" value={draft.personalInfo.intendedMajor} />
                  <ValueRow label="领域" value={draft.personalInfo.intendedApplicationField} />
                  <ValueRow label="入学" value={draft.personalInfo.targetSemester} />
                  <ValueRow label="预算" value={draft.personalInfo.budgetEstimate} />
                  <ValueRow label="学制" value={draft.personalInfo.plannedStudyDuration} />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">教育背景</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.education.length === 0 ? (
                <p className="text-sm text-muted-foreground">未填</p>
              ) : (
                data.education.map((edu, idx) => (
                  <div key={`${edu.school}-${idx}`} className="rounded-md border border-border/70 p-3">
                    <p className="text-sm font-medium text-foreground">{edu.school || "未填学校"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(edu.degree || "未填学位")} · {(edu.major || "未填专业")} · {(edu.gpa || "未填成绩")}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">标化成绩</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ValueRow label="TOEFL" value={draft.tests.toefl?.total} />
              <ValueRow label="IELTS" value={draft.tests.ielts?.overall} />
              <ValueRow label="GRE" value={draft.tests.gre ? `${draft.tests.gre.verbal}/${draft.tests.gre.quantitative}` : ""} />
              <ValueRow label="GMAT" value={draft.tests.gmat?.total} />
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">经历</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">工作经历</p>
                {draft.workExperience.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未填</p>
                ) : (
                  <div className="space-y-2">
                    {draft.workExperience.map((work) => (
                      <div key={work.id} className="rounded-md border border-border/70 p-3 text-sm text-foreground">
                        <p className="font-medium">{(work.company || "未填公司")} · {(work.position || "未填岗位")}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(work.startDate || "未知开始")} - {work.isCurrent ? "至今" : (work.endDate || "未知结束")}
                        </p>
                        {(work.situation || work.task || work.action || work.result) && (
                          <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                            {work.situation && <p><span className="font-medium text-foreground/80">背景：</span>{work.situation}</p>}
                            {work.task && <p><span className="font-medium text-foreground/80">职责：</span>{work.task}</p>}
                            {work.action && <p><span className="font-medium text-foreground/80">行动：</span>{work.action}</p>}
                            {work.result && <p><span className="font-medium text-foreground/80">结果：</span>{work.result}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">项目</p>
                </div>
                {draft.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未填</p>
                ) : (
                  <div className="space-y-2">
                    {draft.projects.map((proj, idx) => (
                      <div key={proj.id} className="rounded-md border border-border/70 p-3 text-sm text-foreground">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              value={proj.name}
                              onChange={(e) => updateProject(idx, "name", e.target.value)}
                              placeholder="项目名称"
                              className="h-9 w-full rounded-md border border-border bg-background px-2 text-foreground outline-none"
                            />
                            <input
                              value={proj.role}
                              onChange={(e) => updateProject(idx, "role", e.target.value)}
                              placeholder="你的角色"
                              className="h-9 w-full rounded-md border border-border bg-background px-2 text-foreground outline-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">{(proj.name || "未填项目")} · {(proj.role || "未填角色")}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {(proj.startDate || "未知开始")} - {(proj.endDate || "未知结束")}
                            </p>
                            {(proj.situation || proj.task || proj.action || proj.result) && (
                              <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                                {proj.situation && <p><span className="font-medium text-foreground/80">背景：</span>{proj.situation}</p>}
                                {proj.task && <p><span className="font-medium text-foreground/80">职责：</span>{proj.task}</p>}
                                {proj.action && <p><span className="font-medium text-foreground/80">行动：</span>{proj.action}</p>}
                                {proj.result && <p><span className="font-medium text-foreground/80">结果：</span>{proj.result}</p>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">荣誉奖项</p>
                {data.honors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未填</p>
                ) : (
                  <div className="space-y-2">
                    {data.honors.map((honor) => (
                      <div key={honor.id} className="rounded-md border border-border/70 p-3 text-sm text-foreground">
                        {(honor.name || "未填奖项")} · {(honor.issuer || "未填颁发方")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">技能</p>
                {data.skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未填</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill) => (
                      <span key={skill.id} className="rounded-md border border-border/70 px-2 py-1 text-xs text-foreground">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
