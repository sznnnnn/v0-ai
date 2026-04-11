import { WriteDocumentPageClient } from "./write-document-page-client";

export default async function WriteDocumentPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId: raw } = await params;
  return <WriteDocumentPageClient programId={decodeURIComponent(raw)} />;
}
