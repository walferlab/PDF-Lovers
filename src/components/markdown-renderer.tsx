import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-pre:rounded-xl prose-pre:border prose-pre:border-black/10 dark:prose-pre:border-white/15">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeSanitize]}
        components={{
          h2: ({ ...props }) => <h2 className="font-heading" {...props} />,
          h3: ({ ...props }) => <h3 className="font-heading" {...props} />,
          pre: ({ ...props }) => <pre className="bg-slate-950/95 text-slate-100" {...props} />,
          code: ({ ...props }) => <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
