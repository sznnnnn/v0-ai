"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMatchResult, useQuestionnaire } from "@/hooks/use-questionnaire";
import { getDraft, saveDraftWorkflow, type DocumentDraftKind } from "@/lib/document-drafts";
import { buildNarrativeOptions, type NarrativeQuestionId } from "@/lib/write-flow";

const STEPS: Array<{ id: NarrativeQuestionId; title: string }> = [
  { id: "who_and_opening", title: "你是谁，你的故事从何开始？" },
  { id: "experience_shaping", title: "你的经历如何塑造了你" },
  { id: "domain_understanding", title: "你对专业的深刻理解" },
  { id: "program_fit", title: "你与项目的匹配度" },
  { id: "future_plan", title: "你的未来规划" },
];

export default function WriteQuestionStepPage() {
  const pathname = usePathname();
  const router = useRouter();
  const parts = pathname.split("/").filter(Boolean);
  const step = (parts[parts.length - 1] ?? "") as NarrativeQuestionId;
  const programId = decodeURIComponent(parts[parts.length - 3] ?? "");
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const { result } = useMatchResult();
  const { data: questionnaireData, isLoaded } = useQuestionnaire();
  const kind: DocumentDraftKind = "ps";

  const pair = useMemo(() => {
    if (!result || !programId) return null;
    const program = result.programs.find((p) => p.id === programId);
    const school = program ? result.schools.find((s) => s.id === program.schoolId) : null;
    return program && school ? { program, school } : null;
  }, [programId, result]);

  const options = useMemo(
    () => (isLoaded ? buildNarrativeOptions(questionnaireData, pair) : null),
    [isLoaded, questionnaireData, pair]
  );

  const existing = getDraft(programId, kind)?.workflow?.narrativeAnswers?.[step];
  const [selectedOption, setSelectedOption] = useState(existing?.selectedOption ?? "");
  const [customText, setCustomText] = useState(existing?.customText ?? "");

  if (!pair || !options || stepIndex < 0) return null;
  const effectiveSelectedOption = selectedOption || options[step]?.[0] || "";

  const prevHref = stepIndex > 0 ? `/workspace/write/${programId}/questions/${STEPS[stepIndex - 1]!.id}` : null;
  const nextHref =
    stepIndex < STEPS.length - 1
      ? `/workspace/write/${programId}/questions/${STEPS[stepIndex + 1]!.id}`
      : `/workspace/write/${programId}`;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="text-xs text-muted-foreground">步骤 {stepIndex + 1}/{STEPS.length}</p>
      <h1 className="mt-1 text-lg font-semibold">{STEPS[stepIndex]!.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">先选一个 AI 推荐切入点，也可以自己写。</p>

      <div className="mt-4 space-y-2">
        {options[step].map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setSelectedOption(op)}
            className={`w-full rounded-md border px-3 py-2 text-left text-sm ${effectiveSelectedOption === op ? "border-primary" : "border-border"}`}
          >
            {op}
          </button>
        ))}
      </div>

      <textarea
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        placeholder="你也可以补充自己的表达（可选）"
        className="mt-4 min-h-28 w-full rounded-md border border-border bg-background p-3 text-sm outline-none"
      />

      <div className="mt-4 flex justify-between">
        {prevHref ? (
          <Button variant="outline" asChild>
            <Link href={prevHref}>上一步</Link>
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={() => {
            const draft = getDraft(programId, kind);
            const prev = draft?.workflow ?? {
              microTaskState: { currentStage: "select_materials" as const, completedStages: [] },
              selectedMaterialIds: [],
              matchedRequirementIds: [],
              paragraphBindings: [],
              intentHistory: [],
              sourceTrace: [],
              recommendationCache: [],
            };
            saveDraftWorkflow(programId, kind, {
              ...prev,
              narrativeAnswers: {
                ...(prev.narrativeAnswers ?? {}),
                [step]: {
                  selectedOption: effectiveSelectedOption || undefined,
                  customText: customText.trim() || undefined,
                },
              },
              microTaskState: {
                currentStage: "refine_draft",
                completedStages: ["select_materials", "match_requirements", "bind_paragraphs", "refine_draft"],
              },
            });
            router.push(nextHref);
          }}
        >
          {stepIndex === STEPS.length - 1 ? "进入编辑器" : "下一步"}
        </Button>
      </div>
    </main>
  );
}
