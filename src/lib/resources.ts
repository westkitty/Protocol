import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ResourceDocument, ResourceKind } from "./types";

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

function loadResources(dir: string, kind: ResourceKind): ResourceDocument[] {
  return walkMarkdownFiles(dir).map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const data = parsed.data as Omit<ResourceDocument, "body" | "kind">;
    return {
      ...data,
      kind,
      body: parsed.content.trim(),
    };
  });
}

export function getAllLanguagePacks(): ResourceDocument[] {
  return loadResources(path.join(process.cwd(), "content", "language-packs"), "language-pack").sort(
    (a, b) => a.title.localeCompare(b.title)
  );
}

export function getAllTaskLibraries(): ResourceDocument[] {
  return loadResources(path.join(process.cwd(), "content", "task-libraries"), "task-library").sort(
    (a, b) => a.title.localeCompare(b.title)
  );
}

export function getAllResources(): ResourceDocument[] {
  return [...getAllLanguagePacks(), ...getAllTaskLibraries()];
}

export function getLanguagePackById(id: string): ResourceDocument | undefined {
  return getAllLanguagePacks().find((item) => item.id === id);
}

export function getTaskLibraryById(id: string): ResourceDocument | undefined {
  return getAllTaskLibraries().find((item) => item.id === id);
}

export { resourceHref, resourceKindLabel } from "./resource-meta.ts";
