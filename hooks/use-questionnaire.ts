"use client";

import { useState, useEffect, useCallback } from "react";
import type { QuestionnaireData, MatchResult } from "@/lib/types";
import { initialQuestionnaireData } from "@/lib/types";
import { enrichSchool } from "@/lib/school-enrichment";

const STORAGE_KEY = "edumatch_questionnaire";
const MATCH_RESULT_KEY = "edumatch_match_result";

export function useQuestionnaire() {
  const [data, setData] = useState<QuestionnaireData>(initialQuestionnaireData);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载数据
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<QuestionnaireData>;
        setData({
          ...initialQuestionnaireData,
          ...parsed,
          personalInfo: {
            ...initialQuestionnaireData.personalInfo,
            ...(parsed.personalInfo ?? {}),
          },
        });
      } catch {
        setData(initialQuestionnaireData);
      }
    }
    setIsLoaded(true);
  }, []);

  // 保存数据到 localStorage
  const saveData = useCallback((newData: Partial<QuestionnaireData>) => {
    setData((prev) => {
      const updated = {
        ...prev,
        ...newData,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 更新当前步骤
  const setCurrentStep = useCallback((step: number) => {
    saveData({ currentStep: step });
  }, [saveData]);

  // 标记步骤完成
  const markStepComplete = useCallback((step: number) => {
    setData((prev) => {
      const completedSteps = prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step];
      const updated = {
        ...prev,
        completedSteps,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 重置数据
  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MATCH_RESULT_KEY);
    setData(initialQuestionnaireData);
  }, []);

  const requiredStepNumbers = [1, 2] as const;

  const hasRequiredPersonalInfo = useCallback(() => {
    return Boolean(
      data.personalInfo.fullName.trim() &&
      data.personalInfo.intendedMajor.trim() &&
      data.personalInfo.targetSemester.trim() &&
      data.personalInfo.targetCountry.length > 0
    );
  }, [data.personalInfo]);

  const hasRequiredEducation = useCallback(() => {
    return data.education.some((edu) =>
      Boolean(edu.school.trim() && edu.degree.trim() && edu.major.trim())
    );
  }, [data.education]);

  // 按真实填写状态计算完成度，供问卷页与工作台共用同一口径
  const getCompletionStatus = useCallback(() => {
    const completedSteps = new Set<number>();
    if (hasRequiredPersonalInfo()) {
      completedSteps.add(1);
    }
    if (hasRequiredEducation()) {
      completedSteps.add(2);
    }

    const hasAnyTestScore = [
      ...Object.values(data.tests.toefl ?? {}),
      ...Object.values(data.tests.ielts ?? {}),
      ...Object.values(data.tests.gre ?? {}),
      ...Object.values(data.tests.gmat ?? {}),
    ].some((value) => value.trim());
    if (hasAnyTestScore) completedSteps.add(3);
    if (data.workExperience.length > 0) completedSteps.add(4);
    if (data.projects.length > 0) completedSteps.add(5);
    if (data.honors.length > 0) completedSteps.add(6);
    if (data.skills.length > 0) completedSteps.add(7);
    if (
      data.personalInfo.futurePlan.trim() ||
      data.personalInfo.motivationNote.trim() ||
      data.personalInfo.otherApplicationNotes.trim()
    ) {
      completedSteps.add(8);
    }

    const missingRequiredSteps = requiredStepNumbers.filter((step) => !completedSteps.has(step));
    return {
      completedSteps: Array.from(completedSteps).sort((a, b) => a - b),
      missingRequiredSteps,
      canGenerateMatch: missingRequiredSteps.length === 0,
    };
  }, [data, hasRequiredEducation, hasRequiredPersonalInfo]);

  return {
    data,
    isLoaded,
    saveData,
    setCurrentStep,
    markStepComplete,
    resetData,
    requiredStepNumbers,
    getCompletionStatus,
  };
}

export function useMatchResult() {
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(MATCH_RESULT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MatchResult;
        setResult({
          ...parsed,
          schools: (parsed.schools ?? []).map((s) => enrichSchool(s)),
        });
      } catch {
        setResult(null);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveResult = useCallback((newResult: MatchResult) => {
    localStorage.setItem(MATCH_RESULT_KEY, JSON.stringify(newResult));
    setResult(newResult);
  }, []);

  const clearResult = useCallback(() => {
    localStorage.removeItem(MATCH_RESULT_KEY);
    setResult(null);
  }, []);

  return { result, isLoaded, saveResult, clearResult };
}
