import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Parses inline markdown tokens (bold, italic, code, links, strikethrough)
 * into safe React elements.
 */
function parseInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return text;

  // Split by markdown inline tokens
  // Matches: **bold**, __bold__, *italic*, _italic_, `code`, ~~strike~~, [text](url)
  const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|(?<!\*)\*[^*]+\*(?!\*)|(?<!_)_[^_]+_(?!_)|`[^`]+`|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **text** or __text__
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-text">
          {parseInlineMarkdown(inner)}
        </strong>
      );
    }

    // Italic: *text* or _text_
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic text-text-secondary">
          {parseInlineMarkdown(inner)}
        </em>
      );
    }

    // Strikethrough: ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~')) {
      const inner = part.slice(2, -2);
      return (
        <del key={index} className="line-through text-text-muted">
          {parseInlineMarkdown(inner)}
        </del>
      );
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="font-mono text-xs px-1.5 py-0.5 rounded-none bg-black/[0.04] dark:bg-white/[0.06] border border-border text-accent font-medium"
        >
          {inner}
        </code>
      );
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      const isInternal = linkUrl.startsWith('/') || linkUrl.startsWith('#');

      if (isInternal) {
        return (
          <Link
            key={index}
            to={linkUrl}
            className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors font-medium"
          >
            {parseInlineMarkdown(linkText)}
          </Link>
        );
      }

      return (
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors font-medium inline-flex items-center gap-0.5"
        >
          <span>{parseInlineMarkdown(linkText)}</span>
          <span className="text-[10px] opacity-70" aria-hidden="true">↗</span>
        </a>
      );
    }

    return part;
  });
}

/**
 * Universal RichTextRenderer for SMRIKAAM CMS Content.
 * Parses long-form Markdown into semantic, beautifully styled HTML elements
 * adhering strictly to the SMRIKAAM design tokens and typography hierarchy.
 */
export default function RichTextRenderer({ content, className = '' }) {
  const renderedElements = useMemo(() => {
    if (!content || typeof content !== 'string') return null;

    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty lines
      if (!trimmed) {
        i++;
        continue;
      }

      // 1. Code Blocks (```lang ... ```)
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // skip closing ```
        elements.push(
          <div key={`code-${i}`} className="cms-code-block my-6 overflow-hidden border border-border bg-black/[0.03] dark:bg-white/[0.02]">
            {lang && (
              <div className="px-4 py-1.5 border-b border-border font-mono text-[11px] uppercase tracking-wider text-text-muted bg-black/[0.02] dark:bg-white/[0.02]">
                {lang}
              </div>
            )}
            <pre className="p-4 font-mono text-xs md:text-sm text-text overflow-x-auto leading-relaxed">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 2. Blockquotes (> ...)
      if (trimmed.startsWith('>')) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        elements.push(
          <blockquote
            key={`quote-${i}`}
            className="cms-blockquote my-6 border-l-2 border-accent pl-4 py-1 text-text-secondary italic text-base md:text-lg leading-relaxed bg-black/[0.015] dark:bg-white/[0.015]"
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx} className={qIdx > 0 ? 'mt-2' : ''}>
                {parseInlineMarkdown(ql)}
              </p>
            ))}
          </blockquote>
        );
        continue;
      }

      // 3. Headings (# H1 to ###### H6)
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2].trim();
        const parsedText = parseInlineMarkdown(headingText);

        switch (level) {
          case 1:
            elements.push(
              <h1
                key={`h1-${i}`}
                className="cms-h1 font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-text mt-12 mb-6 border-b border-border pb-3 first:mt-0"
              >
                {parsedText}
              </h1>
            );
            break;
          case 2:
            elements.push(
              <h2
                key={`h2-${i}`}
                className="cms-h2 font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight text-text mt-10 mb-4 border-b border-border/80 pb-2 first:mt-0"
              >
                {parsedText}
              </h2>
            );
            break;
          case 3:
            elements.push(
              <h3
                key={`h3-${i}`}
                className="cms-h3 font-heading text-xl md:text-2xl font-bold uppercase tracking-wide text-text mt-8 mb-3 first:mt-0 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-accent inline-block shrink-0" aria-hidden="true" />
                <span>{parsedText}</span>
              </h3>
            );
            break;
          case 4:
            elements.push(
              <h4
                key={`h4-${i}`}
                className="cms-h4 font-heading text-lg md:text-xl font-bold uppercase tracking-wide text-text mt-6 mb-2.5 first:mt-0"
              >
                {parsedText}
              </h4>
            );
            break;
          case 5:
          case 6:
          default:
            elements.push(
              <h5
                key={`h5-${i}`}
                className="cms-h5 font-mono text-xs md:text-sm font-bold uppercase tracking-widest text-accent mt-5 mb-2 first:mt-0"
              >
                {parsedText}
              </h5>
            );
            break;
        }
        i++;
        continue;
      }

      // 4. Horizontal Rules (---, ***, ___)
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        elements.push(
          <hr key={`hr-${i}`} className="cms-hr my-8 border-t border-border" />
        );
        i++;
        continue;
      }

      // 5. Tables (| Col 1 | Col 2 |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableRows = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          const rowText = lines[i].trim();
          // Check if separator row (|---|---|)
          const isSeparator = /^\|(\s*:?-+:?\s*\|)+$/.test(rowText);
          if (!isSeparator) {
            const cells = rowText
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim());
            tableRows.push(cells);
          }
          i++;
        }

        if (tableRows.length > 0) {
          const headerRow = tableRows[0];
          const bodyRows = tableRows.slice(1);
          elements.push(
            <div key={`table-${i}`} className="cms-table-wrapper my-6 overflow-x-auto border border-border">
              <table className="min-w-full text-left text-sm divide-y divide-border font-sans">
                <thead className="bg-black/[0.04] dark:bg-white/[0.04]">
                  <tr>
                    {headerRow.map((th, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-text border-r border-border last:border-r-0"
                      >
                        {parseInlineMarkdown(th)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-transparent">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-4 py-3 text-text font-normal border-r border-border last:border-r-0 leading-relaxed"
                        >
                          {parseInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // 6. Unordered Lists (- item, * item)
      if (/^[-*+]\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
          const itemText = lines[i].trim().replace(/^[-*+]\s+/, '');
          listItems.push(itemText);
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="cms-ul my-4 space-y-2.5 pl-2 list-none">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="cms-li flex items-start gap-3 text-base text-text leading-relaxed font-normal">
                <span className="inline-block w-1.5 h-1.5 rounded-none bg-accent shrink-0 mt-2.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  {parseInlineMarkdown(item)}
                </div>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // 7. Ordered Lists (1. item, 2. item)
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          const match = lines[i].trim().match(/^(\d+)\.\s+(.+)$/);
          if (match) {
            listItems.push({ num: match[1], text: match[2] });
          }
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="cms-ol my-4 space-y-2.5 pl-2 list-none">
            {listItems.map((item, lIdx) => (
              <li key={lIdx} className="cms-li flex items-start gap-3 text-base text-text leading-relaxed font-normal">
                <span className="font-mono text-xs font-bold text-accent shrink-0 mt-1 px-1.5 py-0.5 bg-black/[0.04] dark:bg-white/[0.04] border border-border">
                  {item.num}
                </span>
                <div className="flex-1 min-w-0">
                  {parseInlineMarkdown(item.text)}
                </div>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // 8. Paragraphs
      // Accumulate multi-line paragraphs until next block or empty line
      const paraLines = [trimmed];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith('#') &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('>') &&
        !lines[i].trim().startsWith('|') &&
        !/^[-*+]\s+/.test(lines[i].trim()) &&
        !/^\d+\.\s+/.test(lines[i].trim()) &&
        !/^(\-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i].trim());
        i++;
      }

      elements.push(
        <p key={`p-${i}`} className="cms-paragraph text-base md:text-[17px] text-text font-normal leading-[1.7] my-4 first:mt-0 last:mb-0">
          {parseInlineMarkdown(paraLines.join(' '))}
        </p>
      );
    }

    return elements;
  }, [content]);

  if (!renderedElements) return null;

  return (
    <div className={`cms-content max-w-none text-text ${className}`}>
      {renderedElements}
    </div>
  );
}
