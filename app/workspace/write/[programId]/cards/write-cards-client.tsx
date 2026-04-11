"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMatchResult, useQuestionnaire } from "@/hooks/use-questionnaire";
import { getDraft, saveDraftWorkflow, type DocumentDraftKind } from "@/lib/document-drafts";
import { buildParagraphCards, buildProgramSignalOptions, pickBackgroundMaterials } from "@/lib/write-flow";

export function WriteCardsClient({ programId }: { programId: string }) {
  const { result } = useMatchResult();
  const { data: questionnaireData, isLoaded } = useQuestionnaire();
  const kind: DocumentDraftKind = "ps";
  const workflow = getDraft(programId, kind)?.workflow;

  const pair = useMemo(() => {
    if (!result || !programId) return null;
    const program = result.programs.find((p) => p.id === programId);
    const school = program ? result.schools.find((s) => s.id === program.schoolId) : null;
    return program && school ? { program, school } : null;
  }, [programId, result]);
  const materials = useMemo(() => (isLoaded ? pickBackgroundMaterials(questionnaireData) : []), [isLoaded, questionnaireData]);
  const signals = useMemo(() => (pair ? buildProgramSignalOptions(pair) : []), [pair]);

  if (!pair) return null;
  if (!workflow) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-muted-foreground">请先完成前两步。</p>
        <Button className="mt-3" asChild>
          <Link prefetch={false} href={`/workspace/write/${programId}/materials`}>去第 1 步</Link>
        </Button>
      </main>
    );
  }

  const cards = buildParagraphCards(workflow.selectedMaterialIds, workflow.matchedRequirementIds, materials, signals);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-lg font-semibold">步骤 3/4：绑定段落卡</h1>
      <p className="mt-1 text-sm text-muted-foreground">确认后进入编辑器微调。</p>
      <div className="mt-4 space-y-2">
        {cards.map((card) => (
          <div key={card.id} className="rounded-md border border-border p-3">
            <p className="text-sm font-medium">{card.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.editedDraft}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <Button variant="outline" asChild>
          <Link prefetch={false} href={`/workspace/write/${programId}/signals`}>上一步</Link>
        </Button>
        <Button
          asChild
          onClick={() => {
            saveDraftWorkflow(programId, kind, {
              ...workflow,
              paragraphBindings: cards,
              sourceTrace: cards.flatMap((card) =>
                card.materialIds.map((materialId) => ({
                  paragraphId: card.id,
                  materialId,
                  materialTitle: materials.find((m) => m.id === materialId)?.title ?? materialId,
                  excerpt: materials.find((m) => m.id === materialId)?.detail ?? "",
                }))
              ),
              microTaskState: {
                currentStage: "refine_draft",
                completedStages: ["select_materials", "match_requirements", "bind_paragraphs"],
              },
            });
          }}
        >
          <Link prefetch={false} href={`/workspace/write/${programId}`}>进入编辑器</Link>
        </Button>
      </div>
    </main>
  );
}
