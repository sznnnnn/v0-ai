import { WriteQuestionStepClient } from "./write-question-step-client";

export default async function WriteQuestionStepPage({
  params,
}: {
  params: Promise<{ programId: string; step: string }>;
}) {
  const { programId: raw, step } = await params;
  return <WriteQuestionStepClient programId={decodeURIComponent(raw)} step={step} />;
}
