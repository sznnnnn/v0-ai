"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
  required: boolean;
}

const steps: Step[] = [
  { number: 1, title: "个人信息", required: true },
  { number: 2, title: "教育背景", required: true },
  { number: 3, title: "标化成绩", required: false },
  { number: 4, title: "工作经历", required: false },
  { number: 5, title: "项目经历", required: false },
  { number: 6, title: "荣誉奖项", required: false },
  { number: 7, title: "技能", required: false },
];

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export function StepIndicator({ currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden lg:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              <button
                onClick={() => onStepClick(step.number)}
                className="flex flex-col items-center group"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground group-hover:border-primary/50"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium whitespace-nowrap",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                  {step.required && <span className="text-destructive ml-0.5">*</span>}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">
            步骤 {currentStep} / {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep - 1]?.title}
            {steps[currentStep - 1]?.required && <span className="text-destructive ml-0.5">*</span>}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            
            return (
              <button
                key={step.number}
                onClick={() => onStepClick(step.number)}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all",
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                    ? "bg-primary/50"
                    : "bg-border"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
