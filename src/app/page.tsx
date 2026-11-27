import React from "react";
import { getAllScenes } from "@/lib/scenes";
import { getAllLanguagePacks, getAllTaskLibraries } from "@/lib/resources";
import { LibraryClient } from "@/components/LibraryClient";

export default function HomePage() {
  const scenes = getAllScenes();
  const languagePacks = getAllLanguagePacks();
  const taskLibraries = getAllTaskLibraries();
  return (
    <LibraryClient
      scenes={scenes}
      languagePacks={languagePacks}
      taskLibraries={taskLibraries}
    />
  );
}
