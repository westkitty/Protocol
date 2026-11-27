import React from "react";
import { getAllScenes } from "@/lib/scenes";
import { PersonalLibraryClient } from "@/components/PersonalLibraryClient";

export default function PersonalLibraryPage() {
  const scenes = getAllScenes();
  return <PersonalLibraryClient scenes={scenes} />;
}
