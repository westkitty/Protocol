import React from "react";
import { notFound } from "next/navigation";
import { getAllTaskLibraries, getTaskLibraryById } from "@/lib/resources";
import { ResourceDocumentView } from "@/components/ResourceDocumentView";

export function generateStaticParams() {
  return getAllTaskLibraries().map((lib) => ({ id: lib.id }));
}

export default async function TaskLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = getTaskLibraryById(id);
  if (!resource) {
    notFound();
  }
  return <ResourceDocumentView resource={resource} />;
}
