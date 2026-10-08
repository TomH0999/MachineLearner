import Markdown, { type Components, type ExtraProps } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

// Server Component : le Markdown est converti au rendu serveur, sans JS client.
// Pas de rehype-raw : le HTML brut des fiches est ignoré (et les URL `javascript:` sont filtrées par react-markdown).

const EXTERNAL_LINK_PATTERN = /^https?:\/\//i;

/** Retire `node` (arbre hast fourni par react-markdown) : il ne doit pas être transmis au DOM. */
function domProps<P extends ExtraProps>({ node, ...props }: P): Omit<P, "node"> {
  void node;
  return props;
}

const components: Components = {
  h1: (props) => <h1 {...domProps(props)} className={cn("mt-2 mb-4 text-2xl font-semibold", props.className)} />,
  h2: (props) => (
    <h2 {...domProps(props)} className={cn("mt-8 mb-3 border-b pb-1 text-xl font-semibold", props.className)} />
  ),
  h3: (props) => <h3 {...domProps(props)} className={cn("mt-6 mb-2 text-lg font-semibold", props.className)} />,
  p: (props) => <p {...domProps(props)} className={cn("my-3", props.className)} />,
  ul: (props) => <ul {...domProps(props)} className={cn("my-3 list-disc space-y-1 pl-6", props.className)} />,
  ol: (props) => <ol {...domProps(props)} className={cn("my-3 list-decimal space-y-1 pl-6", props.className)} />,
  blockquote: (props) => (
    <blockquote
      {...domProps(props)}
      className={cn(
        "my-4 border-l-4 border-primary/60 bg-muted/40 py-2 pr-2 pl-4 italic [&>:first-child]:mt-0 [&>:last-child]:mb-0",
        props.className,
      )}
    />
  ),
  hr: (props) => <hr {...domProps(props)} className={cn("my-8", props.className)} />,
  // Fond et couleurs du bloc : thème highlight.js (classe `hljs` posée sur <code> par rehype-highlight).
  pre: (props) => <pre {...domProps(props)} className={cn("my-4 overflow-x-auto rounded-lg text-sm", props.className)} />,
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table {...domProps(props)} className={cn("w-full border-collapse text-sm", props.className)} />
    </div>
  ),
  th: (props) => (
    <th {...domProps(props)} className={cn("border bg-muted px-3 py-1.5 text-left font-semibold", props.className)} />
  ),
  td: (props) => <td {...domProps(props)} className={cn("border px-3 py-1.5", props.className)} />,
  a: (props) => {
    const isExternal = EXTERNAL_LINK_PATTERN.test(props.href ?? "");
    return (
      <a
        {...domProps(props)}
        className={cn("text-primary underline underline-offset-4", props.className)}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      />
    );
  },
};

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  return (
    <article
      className={cn(
        "max-w-none text-[15px] leading-7 text-foreground",
        "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em]",
        "[&_.katex-display]:overflow-x-auto [&_.katex-display]:py-1",
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={components}
      >
        {markdown}
      </Markdown>
    </article>
  );
}
