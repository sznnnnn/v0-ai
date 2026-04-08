"use client";

import { useState, useEffect, useCallback } from "react";
import type { QuestionnaireData, MatchResult } from "@/lib/types";
import { initialQuestionnaireData } from "@/lib/types";

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
        const parsed = JSON.parse(stored);
        setData(parsed);
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

  // 检查是否可以生成匹配结果（基础信息和项目经历）
  const canGenerateMatch = useCallback(() => {
    const hasPersonalInfo = data.personalInfo.fullName && 
      data.personalInfo.email && 
      data.personalInfo.targetCountry.length > 0;
    const hasEducation = data.education.length > 0;
    return hasPersonalInfo && hasEducation;
  }, [data]);

  return {
    data,
    isLoaded,
    saveData,
    setCurrentStep,
    markStepComplete,
    resetData,
    canGenerateMatch,
  };
}

export function useMatchResult() {
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(MATCH_RESULT_KEY);
    if (stored) {
      try {
        setResult(JSON.parse(stored));
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
