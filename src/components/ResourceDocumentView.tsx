import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ResourceDocument } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { CategoryEmblem } from "./CategoryEmblem";
import { MarkdownBody } from "./MarkdownBody";
import { resourceKindLabel } from "@/lib/resource-meta";

export function ResourceDocumentView({ resource }: { resource: ResourceDocument }) {
  const catMeta = CATEGORIES.find((c) => c.slug === resource.category_slug);
  const kindLabel = resourceKindLabel(resource.kind);

  return (
    <article className="space-y-6">
      <Link
        href="/#library-resources"
        className="inline-flex items-center gap-1.5 text-xs text-[#A6A6B2] hover:text-[#F5F5F7] min-h-[44px]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Library
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-[#A6A6B2]">
          <span className="inline-flex items-center gap-1.5">
            <CategoryEmblem
              categorySlug={resource.category_slug}
              className="w-3.5 h-3.5 text-[#F87171]"
            />
            {catMeta?.name || resource.category}
          </span>
          <span className="text-[#444]">•</span>
          <span>{kindLabel}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#4A7C59]/20 text-[#88B897] border border-[#4A7C59]/50">
            {resource.tier}
          </span>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg border border-[#C41E2E]/45 bg-[#17171C] flex items-center justify-center text-[#F87171] shrink-0 shadow-[0_0_16px_var(--accent-glow-soft)]">
            <CategoryEmblem categorySlug={resource.category_slug} className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#F5F5F7]">
            {resource.title}
          </h1>
        </div>

        {resource.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {resource.tags.map((tag) => (
              <li
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-[#17171C] text-[#A6A6B2] border border-[#27272F]"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="card-elevated rounded-xl border border-[#27272F] bg-[#101014] p-5 sm:p-7">
        <MarkdownBody source={resource.body} />
      </div>
    </article>
  );
}
