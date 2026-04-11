"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { QuestionnaireBuddy } from "@/components/questionnaire/questionnaire-buddy";
import { FileUpload } from "@/components/questionnaire/file-upload";
import { PersonalInfoForm } from "@/components/questionnaire/steps/personal-info";
import { TargetPreferencesForm } from "@/components/questionnaire/steps/target-preferences";
import { EducationForm } from "@/components/questionnaire/steps/education";
import { StandardizedTestsForm } from "@/components/questionnaire/steps/standardized-tests";
import { WorkExperienceForm } from "@/components/questionnaire/steps/work-experience";
import { ProjectExperienceForm } from "@/components/questionnaire/steps/project-experience";
import { HonorsForm } from "@/components/questionnaire/steps/honors";
import { SkillsForm } from "@/components/questionnaire/steps/skills";
import { ExtensionQuestionsForm } from "@/components/questionnaire/steps/extension-questions";
import { useQuestionnaire } from "@/hooks/use-questionnaire";
import { readWorkspaceVisited, WORKSPACE_BACKGROUND_HREF } from "@/lib/workspace-visited";

const TEST_QUESTIONNAIRE_PARAM = "testQuestionnaire";
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
  const [introName, setIntroName] = useState("");
  const [hasEnteredQuestionnaire, setHasEnteredQuestionnaire] = useState(false);
  const currentStep = data.currentStep;
  const totalSteps = 9;
  const completionStatus = useMemo(() => getCompletionStatus(), [getCompletionStatus]);
  const progress = Math.round((completionStatus.completedSteps.length / totalSteps) * 100);

  const steps = useMemo(
    () => [
      { number: 1, title: "个人信息", required: true },
      { number: 2, title: "意向偏好", required: false },
      { number: 3, title: "教育背景", required: true },
      { number: 4, title: "标化成绩", required: false },
      { number: 5, title: "工作经历", required: false },
      { number: 6, title: "项目经历", required: false },
      { number: 7, title: "荣誉奖项", required: false },
      { number: 8, title: "技能", required: false },
      { number: 9, title: "拓展问题", required: false },
    ],
    []
  );

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    // 测试菜单入口：保留 query，否则下一步 effect 跑完会按「已访问工作台」被重定向走
    if (params.get(TEST_QUESTIONNAIRE_PARAM) === "1") return;
    if (readWorkspaceVisited()) {
      router.replace(WORKSPACE_BACKGROUND_HREF);
    }
  }, [router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  useEffect(() => {
    if (!isLoaded) return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const stepParam = Number(params.get("step"));
    const isValidStep = Number.isInteger(stepParam) && stepParam >= 1 && stepParam <= totalSteps;
    if (mode === "edit" || isValidStep) {
      setHasEnteredQuestionnaire(true);
    }
    if (isValidStep) {
      setCurrentStep(stepParam);
    }
  }, [isLoaded, setCurrentStep, totalSteps]);

  const handleStepClick = useCallback(
    (step: number) => {
      setCurrentStep(step);
    },
    [setCurrentStep]
  );

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

  const handleUploadAutofill = useCallback(() => {
    saveData({
      ...getSampleQuestionnaireDemoPayload(),
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    });
    setNavigationHint("已写入预设答案（示例 B）");
    setShowUploadPanel(false);
  }, [saveData]);

  const handleEnterQuestionnaire = useCallback(() => {
    const trimmedName = introName.trim();
    if (!trimmedName) {
      return;
    }
    saveData({
      personalInfo: {
        ...data.personalInfo,
        fullName: trimmedName,
      },
    });
    setHasEnteredQuestionnaire(true);
  }, [data.personalInfo, introName, saveData]);

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
        return (
          <TargetPreferencesForm
            data={data.personalInfo}
            onChange={(personalInfo) => updateData("personalInfo", personalInfo)}
          />
        );
      case 3:
        return <EducationForm data={data.education} onChange={(education) => updateData("education", education)} />;
      case 4:
        return <StandardizedTestsForm data={data.tests} onChange={(tests) => updateData("tests", tests)} />;
      case 5:
        return (
          <WorkExperienceForm
            data={data.workExperience}
            onChange={(workExperience) => updateData("workExperience", workExperience)}
          />
        );
      case 6:
        return <ProjectExperienceForm data={data.projects} onChange={(projects) => updateData("projects", projects)} />;
      case 7:
        return <HonorsForm data={data.honors} onChange={(honors) => updateData("honors", honors)} />;
      case 8:
        return <SkillsForm data={data.skills} onChange={(skills) => updateData("skills", skills)} />;
      case 9:
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

  if (!hasEnteredQuestionnaire) {
    return (
      <div className="ui-page-shell flex min-h-[100dvh] flex-col justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-md space-y-8">
          <QuestionnaireBuddy mode="intro" />
          <div className="flex min-w-0 items-center gap-2">
            <input
              type="text"
              value={introName}
              onChange={(e) => setIntroName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEnterQuestionnaire();
                }
              }}
              placeholder="你的称呼"
              autoFocus
              aria-describedby="questionnaire-intro-prompt"
              className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            <Button
              type="button"
              onClick={handleEnterQuestionnaire}
              disabled={!introName.trim()}
              className="h-12 min-w-11 shrink-0 px-0 text-lg sm:min-w-12"
              aria-label="进入下一题"
            >
              {">"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page-shell">
      <GuestBanner />

      <header className="sticky top-8 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            BuddyUp
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={handleUploadAutofill}
              aria-label="上传材料"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-28 pt-0">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(200px,260px)_minmax(0,1fr)] lg:gap-x-8 lg:items-start">
          <div className="col-span-full">
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/80 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <QuestionnaireBuddy
            mode="questionnaire"
            currentStep={currentStep}
            displayName={data.personalInfo.fullName}
            className="lg:sticky lg:top-[5.5rem] lg:self-start"
          />

          <div className="min-w-0 space-y-6">
            {showUploadPanel && (
              <div className="rounded-xl border border-border/80 bg-card/90 p-4">
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

            <div className="min-h-[min(70vh,520px)] pr-1">
              <section key={currentStep} className="py-1 sm:py-2">
                {stepForm}
              </section>
            </div>

            <p className="text-center text-xs text-muted-foreground/70">已自动保存</p>
            {navigationHint && (
              <p className="text-center text-xs text-amber-600">{navigationHint}</p>
            )}
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-30 border-t border-border bg-background/85 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrevStep}
            disabled={currentStep <= 1}
            className="h-10 min-w-10 px-0 text-muted-foreground"
            aria-label="上一步"
          >
            {"<"}
          </Button>
          <Button
            type="button"
            onClick={handleNextStep}
            className="h-10 min-w-10 px-0"
            aria-label="下一步"
          >
            {">"}
          </Button>
        </div>
      </div>
    </div>
  );
}
