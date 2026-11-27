import React from "react";

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${idx++}`;
    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-[#17171C] px-1 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}

export function MarkdownBody({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const takeList = (ordered: boolean) => {
    const items: string[] = [];
    const bullet = ordered ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/;
    while (i < lines.length) {
      const m = lines[i].match(bullet);
      if (!m) break;
      items.push(m[1]);
      i += 1;
    }
    const Tag = ordered ? "ol" : "ul";
    const listKey = key++;
    return (
      <Tag
        key={listKey}
        className={`my-3 space-y-1 pl-5 text-sm leading-relaxed text-[#D4D4CE] ${
          ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {items.map((item, idx) => (
          <li key={`${listKey}-${idx}`}>{renderInline(item, `${listKey}-${idx}`)}</li>
        ))}
      </Tag>
    );
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    if (line.trim() === "---") {
      blocks.push(<hr key={key++} className="my-6 border-[#27272F]" />);
      i += 1;
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const Tag = (`h${level}` as unknown) as "h1" | "h2" | "h3";
      const cls =
        level === 1
          ? "font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#F5F5F7] mt-2 mb-3"
          : level === 2
            ? "font-heading text-xl font-bold uppercase tracking-wide text-[#F5F5F7] mt-8 mb-2"
            : "font-heading text-base font-semibold tracking-wide text-[#F87171] mt-5 mb-2";
      blocks.push(
        <Tag key={key++} className={cls}>
          {renderInline(heading[2], `h-${key}`)}
        </Tag>
      );
      i += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      blocks.push(takeList(false));
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      blocks.push(takeList(true));
      continue;
    }
    const para: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,3}\s+|---$|[-*]\s+|\d+\.\s+)/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    const pKey = key++;
    blocks.push(
      <p key={pKey} className="text-sm text-[#D4D4CE] leading-relaxed my-3">
        {renderInline(para.join(" "), `p-${pKey}`)}
      </p>
    );
  }

  return <div className="max-w-3xl">{blocks}</div>;
}
