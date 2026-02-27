import GithubSlugger from "github-slugger";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

import type { TocHeading } from "@/types/blog";

function stringifyNode(node: { type: string; value?: string; children?: unknown[] }): string {
  if (node.type === "text") {
    return node.value ?? "";
  }

  const children = Array.isArray(node.children) ? node.children : [];
  return children
    .map((child) => stringifyNode(child as { type: string; value?: string; children?: unknown[] }))
    .join("");
}

export function extractTableOfContents(markdown: string): TocHeading[] {
  const ast = unified().use(remarkParse).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];

  visit(ast, "heading", (node: any) => {
    if (node.depth < 2 || node.depth > 4) {
      return;
    }

    const text = stringifyNode({
      type: "root",
      children: node.children,
    }).trim();

    if (!text) {
      return;
    }

    headings.push({
      id: slugger.slug(text),
      depth: node.depth,
      text,
    });
  });

  return headings;
}
