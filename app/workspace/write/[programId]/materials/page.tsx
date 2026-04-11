import { WriteMaterialsClient } from "./write-materials-client";

export default async function WriteMaterialsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId: raw } = await params;
  return <WriteMaterialsClient programId={decodeURIComponent(raw)} />;
}
