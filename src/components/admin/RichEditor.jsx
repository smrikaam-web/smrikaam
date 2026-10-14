import React, { useState } from 'react';
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Image, Link as LinkIcon, Table, Minus, Eye, Edit3
} from 'lucide-react';

export default function RichEditor({ value = '', onChange, placeholder = 'Write your content here in Markdown...' }) {
  const [previewMode, setPreviewMode] = useState(false);

  const insertFormat = (prefix, suffix = '', defaultText = '') => {
    const textarea = document.getElementById('rich-editor-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newValue = `${before}${replacement}${after}`;

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const insertTable = () => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Value 1 | Value 2 | Value 3 |\n| Value 4 | Value 5 | Value 6 |\n\n`;
    insertFormat(tableTemplate);
  };

  const renderSimpleMarkdown = (text) => {
    if (!text) return '<p class="text-gray-500 italic">No content to preview.</p>';

    let html = text
      // Escape basic HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Images: ![alt](url)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-4"><img src="$2" alt="$1" class="max-w-full rounded border border-[rgba(255,255,255,0.15)] shadow-md" /><p class="text-xs text-gray-400 font-mono mt-1">$1</p></div>')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-white underline hover:text-neutral-300">$1</a>')
      // Headings
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold font-mono text-[#f4f4f4] mt-5 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold font-mono text-[#f4f4f4] mt-6 mb-3 border-b border-[rgba(255,255,255,0.12)] pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold font-mono text-[#f4f4f4] mt-7 mb-4">$1</h1>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-6 border-[rgba(255,255,255,0.15)]" />')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-white pl-4 py-1 my-3 bg-neutral-900/50 text-neutral-300 italic font-mono text-sm">$1</blockquote>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#f4f4f4]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre class="bg-black p-3 my-3 border border-neutral-700 font-mono text-xs text-white overflow-x-auto"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-neutral-800 text-white px-1.5 py-0.5 font-mono text-xs">$1</code>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 text-sm">$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-3 text-sm text-gray-300 leading-relaxed">');

    return `<p class="mb-3 text-sm text-gray-300 leading-relaxed">${html}</p>`;
  };

  return (
    <div className="border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-none overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => insertFormat('## ', '', 'Heading 2')}
            className="px-2 py-1 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)] flex items-center gap-1 font-bold"
            title="Heading 2"
          >
            <Heading1 className="w-3.5 h-3.5" /> H2
          </button>
          <button
            type="button"
            onClick={() => insertFormat('### ', '', 'Heading 3')}
            className="px-2 py-1 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)] flex items-center gap-1 font-bold"
            title="Heading 3"
          >
            <Heading2 className="w-3.5 h-3.5" /> H3
          </button>

          <div className="h-4 w-px bg-[var(--admin-border)] mx-1" />

          <button
            type="button"
            onClick={() => insertFormat('**', '**', 'bold text')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('*', '*', 'italic text')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[var(--admin-border)] mx-1" />

          <button
            type="button"
            onClick={() => insertFormat('- ', '', 'List item')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('1. ', '', 'Numbered item')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('> ', '', 'Quoted insight')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('```\n', '\n```', '// Code snippet')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[var(--admin-border)] mx-1" />

          <button
            type="button"
            onClick={() => insertFormat('[', '](https://example.com)', 'Link Title')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Add Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('![Image Caption](', ')', 'https://images.unsplash.com/...')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Add Image"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Insert Table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('\n---\n')}
            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)] border border-transparent hover:border-[var(--admin-border)]"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preview Mode Toggle */}
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors border cursor-pointer ${
            previewMode
              ? 'bg-white/10 text-white border-white/40 font-bold'
              : 'bg-[var(--admin-surface-hover)] text-[var(--admin-text-secondary)] hover:text-white border-[var(--admin-border)]'
          }`}
        >
          {previewMode ? (
            <>
              <Edit3 className="w-3.5 h-3.5" /> EDIT
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" /> PREVIEW
            </>
          )}
        </button>
      </div>

      {/* Editor Content / Preview Window */}
      {previewMode ? (
        <div
          className="p-6 bg-[var(--admin-bg)] min-h-[300px] max-h-[500px] overflow-y-auto font-sans prose prose-invert max-w-none text-xs leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(value) }}
        />
      ) : (
        <textarea
          id="rich-editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={14}
          className="w-full p-4 bg-[var(--admin-bg)] text-[var(--admin-text-primary)] font-mono text-xs leading-relaxed focus:outline-none resize-y min-h-[350px]"
        />
      )}
    </div>
  );
}
