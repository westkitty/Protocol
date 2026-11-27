import React from "react";
import { notFound } from "next/navigation";
import { getAllLanguagePacks, getLanguagePackById } from "@/lib/resources";
import { ResourceDocumentView } from "@/components/ResourceDocumentView";

export function generateStaticParams() {
  return getAllLanguagePacks().map((pack) => ({ id: pack.id }));
}

export default async function LanguagePackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = getLanguagePackById(id);
  if (!resource) {
    notFound();
  }
  return <ResourceDocumentView resource={resource} />;
}
