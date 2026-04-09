"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuestionnaire } from "@/hooks/use-questionnaire";

function ValueRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value?.trim() ? value : "未填写"}</span>
    </div>
  );
}

export default function BackgroundPage() {
  const { data, isLoaded } = useQuestionnaire();

  if (!isLoaded) {
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
          <h1 className="text-xl font-semibold text-foreground">我的背景</h1>
          <Button size="sm" asChild>
            <Link href="/questionnaire">继续完善</Link>
          </Button>
        </div>

        <div className="space-y-4">
          <Card className="border-border/80 bg-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ValueRow label="称呼" value={data.personalInfo.fullName} />
              <ValueRow label="目标专业" value={data.personalInfo.intendedMajor} />
              <ValueRow label="申请领域" value={data.personalInfo.intendedApplicationField} />
              <ValueRow label="入学时间" value={data.personalInfo.targetSemester} />
              <ValueRow label="预算" value={data.personalInfo.budgetEstimate} />
              <ValueRow label="学制打算" value={data.personalInfo.plannedStudyDuration} />
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">教育背景</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.education.length === 0 ? (
                <p className="text-sm text-muted-foreground">未填写</p>
              ) : (
                data.education.map((edu, idx) => (
                  <div key={`${edu.school}-${idx}`} className="rounded-md border border-border/70 p-3">
                    <p className="text-sm font-medium text-foreground">{edu.school || "未填写学校"}</p>
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
              <ValueRow label="TOEFL" value={data.tests.toefl?.total} />
              <ValueRow label="IELTS" value={data.tests.ielts?.overall} />
              <ValueRow label="GRE" value={data.tests.gre ? `${data.tests.gre.verbal}/${data.tests.gre.quantitative}` : ""} />
              <ValueRow label="GMAT" value={data.tests.gmat?.total} />
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/95">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">经历与成果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">工作经历</p>
                {data.workExperience.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未填写</p>
                ) : (
                  <div className="space-y-2">
                    {data.workExperience.map((work) => (
                      <div key={work.id} className="rounded-md border border-border/70 p-3 text-sm text-foreground">
                        {(work.company || "未填公司")} · {(work.position || "未填岗位")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">项目经历</p>
                {data.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未填写</p>
                ) : (
                  <div className="space-y-2">
                    {data.projects.map((proj) => (
                      <div key={proj.id} className="rounded-md border border-border/70 p-3 text-sm text-foreground">
                        {(proj.name || "未填项目")} · {(proj.role || "未填角色")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">荣誉奖项</p>
                {data.honors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未填写</p>
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
                  <p className="text-sm text-muted-foreground">未填写</p>
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
