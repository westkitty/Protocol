import React from "react";
import { getAllScenes } from "@/lib/scenes";
import { LibraryClient } from "@/components/LibraryClient";

export default function HomePage() {
  const scenes = getAllScenes();
  return <LibraryClient scenes={scenes} />;
}
