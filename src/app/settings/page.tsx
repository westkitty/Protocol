import React from "react";
import { getAllScenes } from "@/lib/scenes";
import { getAllResources } from "@/lib/resources";
import { SettingsClient } from "@/components/SettingsClient";

export default function SettingsPage() {
  const scenes = getAllScenes();
  const resources = getAllResources();
  return <SettingsClient scenes={scenes} resources={resources} />;
}
