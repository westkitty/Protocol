import type { ResourceDocument, ResourceKind } from "./types";

export function resourceHref(resource: Pick<ResourceDocument, "kind" | "id">): string {
  return resource.kind === "language-pack"
    ? `/language-packs/${resource.id}`
    : `/task-libraries/${resource.id}`;
}

export function resourceKindLabel(kind: ResourceKind): string {
  return kind === "language-pack" ? "Language Pack" : "Task Library";
}
