"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Paperclip, X } from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { FileUpload } from "@/components/questionnaire/file-upload";
import { PersonalInfoForm } from "@/components/questionnaire/steps/personal-info";
import { EducationForm } from "@/components/questionnaire/steps/education";
import { StandardizedTestsForm } from "@/components/questionnaire/steps/standardized-tests";
import { WorkExperienceForm } from "@/components/questionnaire/steps/work-experience";
import { ProjectExperienceForm } from "@/components/questionnaire/steps/project-experience";
import { HonorsForm } from "@/components/questionnaire/steps/honors";
import { SkillsForm } from "@/components/questionnaire/steps/skills";
import { ExtensionQuestionsForm } from "@/components/questionnaire/steps/extension-questions";
import { useQuestionnaire } from "@/hooks/use-questionnaire";
import type { QuestionnaireData } from "@/lib/types";
import {
  getSampleQuestionnaireDemoPayload,
  SAMPLE_QUESTIONNAIRE_DEMO_NOTE,
} from "@/lib/sample-questionnaire-demo";
import {
  getSampleQuestionnaireXinLiuPayload,
  SAMPLE_QUESTIONNAIRE_XIN_LIU_NOTE,
} from "@/lib/sample-questionnaire-xin-liu";

export default function QuestionnairePage() {
  const router = useRouter();
  const { data, isLoaded, saveData, setCurrentStep, getCompletionStatus } = useQuestionnaire();
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [navigationHint, setNavigationHint] = useState("");
  const currentStep = data.currentStep;
  const totalSteps = 8;
  const completionStatus = useMemo(() => getCompletionStatus(), [getCompletionStatus]);
  const progress = Math.round((completionStatus.completedSteps.length / totalSteps) * 100);

  const steps = useMemo(
    () => [
      { number: 1, title: "个人信息", required: true },
      { number: 2, title: "教育背景", required: true },
      { number: 3, title: "标化成绩", required: false },
      { number: 4, title: "工作经历", required: false },
      { number: 5, title: "项目经历", required: false },
      { number: 6, title: "荣誉奖项", required: false },
      { number: 7, title: "技能", required: false },
      { number: 8, title: "拓展问题", required: false },
    ],
    []
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const handleStepClick = useCallback(
    (step: number) => {
      setCurrentStep(step);
    },
    [setCurrentStep]
  );

  const handleGenerateMatch = useCallback(() => {
    if (!completionStatus.canGenerateMatch) {
      setNavigationHint("请先完成必填步骤：个人信息、教育背景。");
      return;
    }
    router.push("/match");
  }, [completionStatus.canGenerateMatch, router]);

  const updateData = useCallback(
    (field: keyof QuestionnaireData, value: unknown) => {
      saveData({ [field]: value });
    },
    [saveData]
  );

  const handleNextStep = useCallback(() => {
    setNavigationHint("");
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }
    if (!completionStatus.canGenerateMatch) {
      setNavigationHint("请先完成必填步骤：个人信息、教育背景。");
      return;
    }
    router.push("/match");
  }, [completionStatus.canGenerateMatch, currentStep, router, setCurrentStep, totalSteps]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

  const handleLoadXinLiuSample = useCallback(() => {
    if (
      !confirm(
        "将载入示例 A「刘欣 / 华科产品设计」：覆盖个人信息、教育、工作、项目、荣誉与技能（标化为空）；已上传附件会保留。确定？"
      )
    ) {
      return;
    }
    saveData({
      ...getSampleQuestionnaireXinLiuPayload(),
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    });
  }, [saveData]);

  const handleLoadDemoSample = useCallback(() => {
    if (
      !confirm(
        "将载入示例 B「林予安 / 南科大电子工程」：覆盖个人信息、教育、标化、工作、项目、荣誉与技能；已上传附件会保留。确定？"
      )
    ) {
      return;
    }
    saveData({
      ...getSampleQuestionnaireDemoPayload(),
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    });
  }, [saveData]);

  const stepForm = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoForm
            data={data.personalInfo}
            onChange={(personalInfo) => updateData("personalInfo", personalInfo)}
          />
        );
      case 2:
        return <EducationForm data={data.education} onChange={(education) => updateData("education", education)} />;
      case 3:
        return <StandardizedTestsForm data={data.tests} onChange={(tests) => updateData("tests", tests)} />;
      case 4:
        return (
          <WorkExperienceForm
            data={data.workExperience}
            onChange={(workExperience) => updateData("workExperience", workExperience)}
          />
        );
      case 5:
        return <ProjectExperienceForm data={data.projects} onChange={(projects) => updateData("projects", projects)} />;
      case 6:
        return <HonorsForm data={data.honors} onChange={(honors) => updateData("honors", honors)} />;
      case 7:
        return <SkillsForm data={data.skills} onChange={(skills) => updateData("skills", skills)} />;
      case 8:
        return (
          <ExtensionQuestionsForm
            data={data.personalInfo}
            onChange={(personalInfo) => updateData("personalInfo", personalInfo)}
          />
        );
      default:
        return null;
    }
  }, [currentStep, data, updateData]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <GuestBanner />

      <header className="sticky top-8 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            EduMatch
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-3"
              onClick={() => setShowUploadPanel((v) => !v)}
              aria-label="上传材料"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="text-xs">上传材料</span>
            </Button>
            <Button
              onClick={handleGenerateMatch}
              size="sm"
              className="h-9 gap-1.5 px-3"
              aria-label="去匹配"
              disabled={!completionStatus.canGenerateMatch}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="text-xs">去匹配</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {showUploadPanel && (
          <div className="mb-6 rounded-xl border border-border/80 bg-card/90 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">上传材料</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowUploadPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FileUpload files={data.files} onFilesChange={(files) => updateData("files", files)} />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-border/80 bg-card/90 p-3">
              <div className="space-y-1">
                {steps.map((step) => {
                  const isCurrent = currentStep === step.number;
                  return (
                    <button
                      key={step.number}
                      onClick={() => handleStepClick(step.number)}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        isCurrent
                          ? "bg-foreground text-background"
                          : "text-muted-foreground/75 hover:bg-muted/40"
                      }`}
                    >
                      <span className={`w-7 text-xs ${isCurrent ? "text-background/80" : "text-muted-foreground/70"}`}>{String(step.number).padStart(2, "0")}</span>
                      <span className={isCurrent ? "font-medium" : "font-normal"}>{step.title}</span>
                      {step.required && <span className={`text-xs ${isCurrent ? "text-background/80" : "text-muted-foreground/70"}`}>*</span>}
                      {completionStatus.completedSteps.includes(step.number) && (
                        <span
                          className={`ml-auto inline-flex items-center ${isCurrent ? "text-background/85" : "text-muted-foreground/80"}`}
                          aria-label="已完成"
                          title="已完成"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden />
                          <span className="sr-only">已完成</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-border/60 px-2 pt-3">
                <p className="mb-2 text-[10px] font-medium text-foreground/80">演示用两套完整示例</p>
                <p className="mb-1.5 text-[10px] leading-relaxed text-muted-foreground">{SAMPLE_QUESTIONNAIRE_XIN_LIU_NOTE}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mb-2 h-8 w-full text-xs font-normal"
                  onClick={handleLoadXinLiuSample}
                >
                  载入示例 A · 设计/HCI
                </Button>
                <p className="mb-1.5 text-[10px] leading-relaxed text-muted-foreground">{SAMPLE_QUESTIONNAIRE_DEMO_NOTE}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-full text-xs font-normal"
                  onClick={handleLoadDemoSample}
                >
                  载入示例 B · 电子/嵌入式
                </Button>
              </div>
              <div className="mt-3 border-t border-border/60 px-2 pt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>完成度</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/80 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </aside>

          <div className="min-h-[min(70vh,520px)] pr-1">
            <section
              key={currentStep}
              className="rounded-xl border border-border/80 bg-card/95 p-8"
            >
              {stepForm}
            </section>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">已自动保存</p>
        {navigationHint && (
          <p className="mt-2 text-center text-xs text-amber-600">{navigationHint}</p>
        )}
      </main>

      <div className="sticky bottom-0 z-30 border-t border-border bg-background/85 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrevStep}
            disabled={currentStep <= 1}
            className="h-10 min-w-28 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            上一步
          </Button>
          <Button
            type="button"
            onClick={handleNextStep}
            className="h-10 min-w-32"
          >
            {currentStep === totalSteps ? "完成" : "下一步"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
