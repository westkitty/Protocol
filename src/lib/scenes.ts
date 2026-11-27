import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Scene } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "scenes");

function walkMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

export function getAllScenes(): Scene[] {
  const files = walkMarkdownFiles(CONTENT_DIR);
  const scenes: Scene[] = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const data = parsed.data as Omit<Scene, "body">;
    return {
      ...data,
      body: parsed.content.trim(),
    };
  });

  return scenes.sort((a, b) => {
    if (a.category_slug !== b.category_slug) {
      return a.category_slug.localeCompare(b.category_slug);
    }
    return a.title.localeCompare(b.title);
  });
}

export function getSceneById(id: string): Scene | undefined {
  return getAllScenes().find((scene) => scene.id === id);
}

export function getScenesByCategory(categorySlug: string): Scene[] {
  return getAllScenes().filter((scene) => scene.category_slug === categorySlug);
}
