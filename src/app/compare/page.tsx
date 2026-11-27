import React from "react";
import { getAllScenes } from "@/lib/scenes";
import { CompareClient } from "@/components/CompareClient";

export default function ComparePage() {
  const scenes = getAllScenes();
  return <CompareClient scenes={scenes} />;
}
