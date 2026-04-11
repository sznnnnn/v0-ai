import { WriteCardsClient } from "./write-cards-client";

export default async function WriteCardsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId: raw } = await params;
  return <WriteCardsClient programId={decodeURIComponent(raw)} />;
}
