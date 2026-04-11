"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMatchResult } from "@/hooks/use-questionnaire";
import {
  getDraft,
  saveDraftWorkflow,
  type DocumentDraftKind,
  type DraftWorkflowState,
  type MicroTaskStage,
} from "@/lib/document-drafts";

type NarrativeQuestion = {
  key: string;
  title: string;
  prompt: string;
  options: string[];
  placeholder: string;
};

const QUESTIONS: NarrativeQuestion[] = [
  {
    key: "origin",
    title: "你是谁，你的故事从何开始？",
    prompt: "请描述你的出发点：为什么你会走到这条申请路径上。",
    options: ["课程触发", "项目触发", "实习/工作触发", "个人经历触发"],
    placeholder: "补充具体情境：发生了什么，让你开始认真考虑这个方向？",
  },
  {
    key: "challenge_action_reflection",
    title: "你的经历如何塑造了你",
    prompt: "围绕一次关键经历说明：挑战、行动、收获与反思。",
    options: ["挑战-行动-结果", "研究探索型", "跨团队协作型", "失败后迭代型"],
    placeholder: "当时面临什么问题？你做了什么？学到了什么？",
  },
  {
    key: "industry_insight",
    title: "你对专业的深刻理解",
    prompt: "展示你对学科/行业的观察，而不仅是兴趣。",
    options: ["过去趋势分析", "未来机会判断", "方法论理解", "问题导向视角"],
    placeholder: "可结合过去 5-10 年趋势，或你判断未来机会在哪里。",
  },
  {
    key: "fit_with_program",
    title: "你与项目的匹配度",
    prompt: "说明为什么是这个项目与学校。",
    options: ["课程匹配", "教授/实验室匹配", "培养路径匹配", "地域与资源匹配"],
    placeholder: "写出具体课程、教授方向、实验室或资源名称，以及它如何补足你的能力缺口。",
  },
  {
    key: "future_plan",
    title: "你的未来规划",
    prompt: "体现你的短期与长期目标。",
    options: ["学术研究路径", "产业实践路径", "产品/创业路径", "跨学科复合路径"],
    placeholder: "短期想在项目中学什么，长期想解决什么问题、在哪个领域贡献价值。",
  },
];

function buildBaseWorkflow(): DraftWorkflowState {
  return {
    microTaskState: {
      currentStage: "select_materials" as MicroTaskStage,
      completedStages: [],
    },
    selectedMaterialIds: [],
    matchedRequirementIds: [],
    paragraphBindings: [],
    intentHistory: [],
    sourceTrace: [],
    recommendationCache: [],
    narrativeAnswers: {},
  };
}

export function WriteQuestionStepClient({
  programId,
  step: rawStepParam,
}: {
  programId: string;
  step: string;
}) {
  const router = useRouter();
  const { result } = useMatchResult();
  const rawStep = Number(rawStepParam ?? "1");
  const step = Number.isFinite(rawStep) ? Math.max(1, Math.min(QUESTIONS.length, rawStep)) : 1;
  const current = QUESTIONS[step - 1]!;
  const kind: DocumentDraftKind = "ps";

  const pair = useMemo(() => {
    if (!result || !programId) return null;
    const program = result.programs.find((p) => p.id === programId);
    if (!program) return null;
    const school = result.schools.find((s) => s.id === program.schoolId);
    return school ? { program, school } : null;
  }, [result, programId]);

  const existingAnswer = getDraft(programId, kind)?.workflow?.narrativeAnswers?.[current.key];
  const [selectedOption, setSelectedOption] = useState(existingAnswer?.selectedOption ?? "");
  const [customText, setCustomText] = useState(existingAnswer?.customText ?? "");

  function persistCurrentAnswer() {
    const prev = getDraft(programId, kind)?.workflow ?? buildBaseWorkflow();
    const narrativeAnswers = {
      ...(prev.narrativeAnswers ?? {}),
      [current.key]: {
        selectedOption: selectedOption.trim() || undefined,
        customText: customText.trim() || undefined,
      },
    };
    saveDraftWorkflow(programId, kind, {
      ...prev,
      narrativeAnswers,
    });
  }

  function goNext() {
    if (!programId) return;
    persistCurrentAnswer();
    if (step >= QUESTIONS.length) {
      router.push(`/workspace/write/${programId}?mode=fresh`);
      return;
    }
    router.push(`/workspace/write/${programId}/questions/${step + 1}`);
  }

  function goPrev() {
    if (!programId) return;
    persistCurrentAnswer();
    if (step <= 1) {
      router.push(`/workspace/write/${programId}`);
      return;
    }
    router.push(`/workspace/write/${programId}/questions/${step - 1}`);
  }

  if (!programId) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link prefetch={false} href={`/workspace/write/${programId}`}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回文书页
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            第 {step}/{QUESTIONS.length} 步
          </p>
        </div>

        <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
          <h1 className="text-lg font-semibold text-foreground">{current.title}</h1>
          {pair ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {pair.school.nameEn} · {pair.program.nameEn}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-muted-foreground">{current.prompt}</p>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-medium text-foreground">快速选择（可选）</p>
            <div className="flex flex-wrap gap-2">
              {current.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedOption(option)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    selectedOption === option
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <Input
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              placeholder="可自定义一个选项标签（例如：数据驱动转向）"
            />
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-foreground">详细描述（建议填写）</p>
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={current.placeholder}
              className="min-h-[150px]"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={goPrev}>
              上一步
            </Button>
            <Button onClick={goNext}>{step >= QUESTIONS.length ? "完成并生成文书" : "下一步"}</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
