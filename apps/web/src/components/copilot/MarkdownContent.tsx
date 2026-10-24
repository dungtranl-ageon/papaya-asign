'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownContentProps {
  content: string;
  isUser?: boolean;
  onOpenPolicyBrowser?: (clauseId: string) => void;
}

export function MarkdownContent({
  content,
  isUser = false,
  onOpenPolicyBrowser,
}: MarkdownContentProps) {
  return (
    <div
      className={`text-xs leading-relaxed space-y-1 ${isUser ? 'text-white' : 'text-slate-800'}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => (
            <p
              className={
                isUser
                  ? 'mb-1.5 last:mb-0 leading-relaxed'
                  : 'mb-2 last:mb-0 leading-relaxed text-slate-800'
              }
            >
              {children}
            </p>
          ),
          h1: ({ children }) => (
            <h1
              className={`text-sm font-bold my-2 text-inherit ${isUser ? 'text-white' : 'text-slate-900'}`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-xs font-bold my-1.5 text-inherit ${isUser ? 'text-white' : 'text-slate-900'}`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-xs font-bold my-1 text-inherit ${isUser ? 'text-white' : 'text-slate-900'}`}
            >
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className={isUser ? 'font-bold text-white' : 'font-bold text-slate-900'}>
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul
              className={`list-disc pl-4 space-y-1 my-1.5 ${isUser ? 'marker:text-teal-200' : 'marker:text-teal-600'}`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`list-decimal pl-4 space-y-1 my-1.5 ${isUser ? 'marker:text-teal-200' : 'marker:text-teal-600'}`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className={
                isUser
                  ? 'border-l-2 border-teal-300 pl-2.5 my-1.5 italic text-teal-100 bg-teal-800/40 py-1 rounded-r'
                  : 'border-l-2 border-teal-600 pl-2.5 my-1.5 italic text-slate-600 bg-teal-50/50 py-1 rounded-r'
              }
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
              <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 font-semibold text-slate-700">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-800">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 text-[11px] text-slate-700">{children}</td>
          ),
          hr: () => <hr className={`my-2 ${isUser ? 'border-teal-600' : 'border-slate-200'}`} />,
          a: ({ href, children }) => {
            const isPolicyLink =
              href && (href.startsWith('policy://') || href.startsWith('#POLICY-'));
            if (isPolicyLink && onOpenPolicyBrowser && href) {
              const clauseId = href.replace(/^policy:\/\//, '').replace(/^#/, '');
              return (
                <button
                  type="button"
                  onClick={() => onOpenPolicyBrowser(clauseId)}
                  className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-800 underline cursor-pointer"
                >
                  {children}
                </button>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline font-medium ${
                  isUser ? 'text-teal-100 hover:text-white' : 'text-teal-600 hover:text-teal-800'
                }`}
              >
                {children}
              </a>
            );
          },
          code: ({ className, children }) => {
            const isCodeBlock = Boolean(className);
            if (isCodeBlock) {
              return (
                <pre className="my-2 p-2.5 rounded-lg font-mono text-[11px] bg-slate-900 text-slate-100 overflow-x-auto leading-relaxed">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code
                className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
                  isUser
                    ? 'bg-teal-800/80 text-teal-100 border border-teal-600/40'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
