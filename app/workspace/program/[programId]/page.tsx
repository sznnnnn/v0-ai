import { ProgramDetailClient } from "./program-detail-client";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId: raw } = await params;
  return <ProgramDetailClient programId={decodeURIComponent(raw)} />;
}
