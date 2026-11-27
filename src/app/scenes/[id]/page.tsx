import React from "react";
import { notFound } from "next/navigation";
import { getAllScenes, getSceneById } from "@/lib/scenes";
import { SceneWorkspace } from "@/components/SceneWorkspace";

export function generateStaticParams() {
  return getAllScenes().map((scene) => ({ id: scene.id }));
}

export default async function SceneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenes = getAllScenes();
  const scene = scenes.find((item) => item.id === id) ?? getSceneById(id);
  if (!scene) {
    notFound();
  }

  return <SceneWorkspace scene={scene} librarySize={scenes.length} />;
}
