"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMatchResult } from "@/hooks/use-questionnaire";
import { getDraft, saveDraftWorkflow, type DocumentDraftKind } from "@/lib/document-drafts";
import { buildProgramSignalOptions, recommendProjectSignalIds } from "@/lib/write-flow";

export function WriteSignalsClient({ programId }: { programId: string }) {
  const buildBaseWorkflow = () => ({
    microTaskState: { currentStage: "select_materials" as const, completedStages: [] as Array<"select_materials" | "match_requirements" | "bind_paragraphs" | "refine_draft"> },
    selectedMaterialIds: [],
    matchedRequirementIds: [],
    paragraphBindings: [],
    intentHistory: [],
    sourceTrace: [],
    recommendationCache: [],
  });
  const { result } = useMatchResult();
  const kind: DocumentDraftKind = "ps";
  const [customInput, setCustomInput] = useState("");
  const [customSignals, setCustomSignals] = useState<Array<{ id: string; text: string }>>([]);
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>(() => getDraft(programId, kind)?.workflow?.matchedRequirementIds ?? []);

  const pair = useMemo(() => {
    if (!result || !programId) return null;
    const program = result.programs.find((p) => p.id === programId);
    const school = program ? result.schools.find((s) => s.id === program.schoolId) : null;
    return program && school ? { program, school } : null;
  }, [programId, result]);

  const signalOptions = useMemo(() => (pair ? buildProgramSignalOptions(pair) : []), [pair]);
  const recommendedSignalIds = useMemo(
    () => (pair ? recommendProjectSignalIds(signalOptions, pair.program.matchReasons ?? []) : []),
    [pair, signalOptions]
  );
  const allSignals = [...signalOptions, ...customSignals];

  useEffect(() => {
    if (selectedSignalIds.length > 0) return;
    if (recommendedSignalIds.length > 0) {
      setSelectedSignalIds(recommendedSignalIds);
      return;
    }
    if (signalOptions.length > 0) {
      setSelectedSignalIds(signalOptions.slice(0, 2).map((s) => s.id));
    }
  }, [recommendedSignalIds, selectedSignalIds.length, signalOptions]);
  if (!pair) return null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-lg font-semibold">步骤 2/4：匹配项目信息标签</h1>
      <p className="mt-1 text-sm text-muted-foreground">选择课程、方向、资源标签。</p>
      <div className="mt-3 flex gap-2">
        <input
          className="h-9 flex-1 rounded border border-border px-3 text-sm"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="自定义标签，如 Professor X · HCI Lab"
        />
        <Button
          variant="outline"
          onClick={() => {
            const t = customInput.trim();
            if (!t) return;
            setCustomSignals((prev) => [...prev, { id: `custom_signal_${Date.now()}`, text: `自定义：${t}` }]);
            setCustomInput("");
          }}
        >
          添加
        </Button>
      </div>
      <div className="mt-4 space-y-2">
        {allSignals.map((s) => (
          <button
            key={s.id}
            className={`w-full rounded-md border px-3 py-2 text-left text-sm ${selectedSignalIds.includes(s.id) ? "border-primary" : "border-border"}`}
            onClick={() =>
              setSelectedSignalIds((prev) => (prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]))
            }
          >
            {s.text}
            {recommendedSignalIds.includes(s.id) ? <span className="ml-2 text-xs text-primary">推荐</span> : null}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <Button variant="outline" asChild>
          <Link prefetch={false} href={`/workspace/write/${programId}/materials`}>上一步</Link>
        </Button>
        <Button
          asChild
          disabled={selectedSignalIds.length === 0}
          onClick={() => {
            const prev = getDraft(programId, kind)?.workflow ?? buildBaseWorkflow();
            saveDraftWorkflow(programId, kind, {
              ...prev,
              matchedRequirementIds: selectedSignalIds,
              microTaskState: {
                currentStage: "bind_paragraphs",
                completedStages: ["select_materials", "match_requirements"],
              },
            });
          }}
        >
          <Link prefetch={false} href={`/workspace/write/${programId}/cards`}>下一步</Link>
        </Button>
      </div>
    </main>
  );
}
