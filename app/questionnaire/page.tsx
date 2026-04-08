"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GuestBanner } from "@/components/questionnaire/guest-banner";
import { StepIndicator } from "@/components/questionnaire/step-indicator";
import { FileUpload } from "@/components/questionnaire/file-upload";
import { PersonalInfoForm } from "@/components/questionnaire/steps/personal-info";
import { EducationForm } from "@/components/questionnaire/steps/education";
import { StandardizedTestsForm } from "@/components/questionnaire/steps/standardized-tests";
import { WorkExperienceForm } from "@/components/questionnaire/steps/work-experience";
import { ProjectExperienceForm } from "@/components/questionnaire/steps/project-experience";
import { HonorsForm } from "@/components/questionnaire/steps/honors";
import { SkillsForm } from "@/components/questionnaire/steps/skills";
import { useQuestionnaire } from "@/hooks/use-questionnaire";
import type { QuestionnaireData } from "@/lib/types";

export default function QuestionnairePage() {
  const router = useRouter();
  const { data, isLoaded, saveData, setCurrentStep, markStepComplete, canGenerateMatch } = useQuestionnaire();

  const currentStep = data.currentStep;

  const handleNext = useCallback(() => {
    markStepComplete(currentStep);
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/match");
    }
  }, [currentStep, markStepComplete, setCurrentStep, router]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, [setCurrentStep]);

  const handleGenerateMatch = useCallback(() => {
    router.push("/match");
  }, [router]);

  const updateData = useCallback((field: keyof QuestionnaireData, value: unknown) => {
    saveData({ [field]: value });
  }, [saveData]);

  const isCurrentStepValid = useCallback(() => {
    switch (currentStep) {
      case 1:
        return data.personalInfo.fullName && 
               data.personalInfo.email && 
               data.personalInfo.targetCountry.length > 0 &&
               data.personalInfo.intendedMajor &&
               data.personalInfo.targetDegree &&
               data.personalInfo.targetSemester;
      case 2:
        return data.education.length > 0 && 
               data.education.every(edu => edu.school && edu.degree && edu.major);
      default:
        return true;
    }
  }, [currentStep, data]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GuestBanner />
      
      {/* Header */}
      <header className="sticky top-8 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            EduMatch
          </Link>
          
          {canGenerateMatch() && (
            <Button 
              onClick={handleGenerateMatch}
              size="sm"
              className="h-8"
            >
              生成匹配结果
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Step Indicator */}
        <div className="mb-10">
          <StepIndicator 
            currentStep={currentStep}
            completedSteps={data.completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Step Content */}
        <div className="rounded-lg border border-border bg-card p-8">
          {currentStep === 1 && (
            <PersonalInfoForm
              data={data.personalInfo}
              onChange={(personalInfo) => updateData("personalInfo", personalInfo)}
            />
          )}

          {currentStep === 2 && (
            <EducationForm
              data={data.education}
              onChange={(education) => updateData("education", education)}
            />
          )}

          {currentStep === 3 && (
            <StandardizedTestsForm
              data={data.tests}
              onChange={(tests) => updateData("tests", tests)}
            />
          )}

          {currentStep === 4 && (
            <WorkExperienceForm
              data={data.workExperience}
              onChange={(workExperience) => updateData("workExperience", workExperience)}
            />
          )}

          {currentStep === 5 && (
            <ProjectExperienceForm
              data={data.projects}
              onChange={(projects) => updateData("projects", projects)}
            />
          )}

          {currentStep === 6 && (
            <HonorsForm
              data={data.honors}
              onChange={(honors) => updateData("honors", honors)}
            />
          )}

          {currentStep === 7 && (
            <SkillsForm
              data={data.skills}
              onChange={(skills) => updateData("skills", skills)}
            />
          )}

          {/* File Upload */}
          <div className="mt-10 border-t border-border pt-8">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              补充材料（可选）
            </h3>
            <FileUpload
              files={data.files}
              onFilesChange={(files) => updateData("files", files)}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="h-9"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            上一步
          </Button>

          <div className="flex items-center gap-3">
            {canGenerateMatch() && (
              <Button 
                variant="outline"
                onClick={handleGenerateMatch}
                className="h-9 sm:hidden"
              >
                生成匹配
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={currentStep <= 2 && !isCurrentStepValid()}
              className="h-9"
            >
              {currentStep === 7 ? "完成并匹配" : "下一步"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Auto-save hint */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          所有信息已自动保存到本地
        </p>
      </main>
    </div>
  );
}
