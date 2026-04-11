import { WriteSignalsClient } from "./write-signals-client";

export default async function WriteSignalsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId: raw } = await params;
  return <WriteSignalsClient programId={decodeURIComponent(raw)} />;
}
