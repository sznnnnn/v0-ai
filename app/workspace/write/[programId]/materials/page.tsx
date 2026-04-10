"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMatchResult, useQuestionnaire } from "@/hooks/use-questionnaire";
import { getDraft, saveDraftWorkflow, type DocumentDraftKind } from "@/lib/document-drafts";
import { buildProgramSignalOptions, pickBackgroundMaterials, recommendMaterialIds } from "@/lib/write-flow";

export default function WriteMaterialsPage() {
  const buildBaseWorkflow = () => ({
    microTaskState: { currentStage: "select_materials" as const, completedStages: [] as Array<"select_materials" | "match_requirements" | "bind_paragraphs" | "refine_draft"> },
    selectedMaterialIds: [],
    matchedRequirementIds: [],
    paragraphBindings: [],
    intentHistory: [],
    sourceTrace: [],
    recommendationCache: [],
  });
  const pathname = usePathname();
  const programId = useMemo(() => decodeURIComponent(pathname.split("/").filter(Boolean).slice(-2)[0] ?? ""), [pathname]);
  const { result } = useMatchResult();
  const { data: questionnaireData, isLoaded } = useQuestionnaire();
  const kind: DocumentDraftKind = "ps";
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getDraft(programId, kind)?.workflow?.selectedMaterialIds ?? []);

  const pair = useMemo(() => {
    if (!result || !programId) return null;
    const program = result.programs.find((p) => p.id === programId);
    const school = program ? result.schools.find((s) => s.id === program.schoolId) : null;
    return program && school ? { program, school } : null;
  }, [programId, result]);
  const materials = useMemo(() => (isLoaded ? pickBackgroundMaterials(questionnaireData) : []), [isLoaded, questionnaireData]);
  const recommended = useMemo(
    () => (pair ? recommendMaterialIds(materials, buildProgramSignalOptions(pair), pair.program.matchReasons ?? []) : []),
    [materials, pair]
  );

  useEffect(() => {
    if (selectedIds.length > 0) return;
    if (recommended.length > 0) {
      setSelectedIds(recommended);
      return;
    }
    if (materials.length > 0) {
      setSelectedIds([materials[0]!.id]);
    }
  }, [materials, recommended, selectedIds.length]);

  if (!pair) return null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-lg font-semibold">步骤 1/4：挑选素材</h1>
      <p className="mt-1 text-sm text-muted-foreground">至少选择 1 条。</p>
      <div className="mt-4 space-y-2">
        {materials.map((m) => (
          <button
            key={m.id}
            className={`w-full rounded-md border px-3 py-2 text-left ${selectedIds.includes(m.id) ? "border-primary" : "border-border"}`}
            onClick={() => setSelectedIds((prev) => (prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]))}
          >
            <p className="text-sm font-medium">
              {m.title}
              {recommended.includes(m.id) ? <span className="ml-2 text-xs text-primary">推荐</span> : null}
            </p>
            <p className="text-xs text-muted-foreground">{m.detail}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          asChild
          disabled={selectedIds.length === 0}
          onClick={() => {
            const prev = getDraft(programId, kind)?.workflow ?? buildBaseWorkflow();
            saveDraftWorkflow(programId, kind, {
              ...prev,
              selectedMaterialIds: selectedIds,
              recommendationCache: recommended,
              microTaskState: {
                currentStage: "match_requirements",
                completedStages: ["select_materials"],
              },
            });
          }}
        >
          <Link href={`/workspace/write/${programId}/signals`}>下一步</Link>
        </Button>
      </div>
    </main>
  );
}
