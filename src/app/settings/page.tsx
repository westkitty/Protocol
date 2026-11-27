import React from "react";
import { getAllScenes } from "@/lib/scenes";
import { SettingsClient } from "@/components/SettingsClient";

export default function SettingsPage() {
  const scenes = getAllScenes();
  return <SettingsClient scenes={scenes} />;
}
