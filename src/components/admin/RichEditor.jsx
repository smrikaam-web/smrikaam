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
    if (!text) return '<p class="text-neutral-400 italic">No content to preview.</p>';

    let html = text
      // Escape basic HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Images: ![alt](url)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-4"><img src="$2" alt="$1" class="max-w-full border border-[#E5E5E5] shadow-sm" /><p class="text-xs text-neutral-500 font-mono mt-1">$1</p></div>')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#111111] underline hover:text-neutral-600 font-semibold">$1</a>')
      // Headings
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold font-mono text-[#111111] mt-5 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold font-mono text-[#111111] mt-6 mb-3 border-b border-[#E5E5E5] pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold font-mono text-[#111111] mt-7 mb-4">$1</h1>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-6 border-[#E5E5E5]" />')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-[#111111] pl-4 py-1 my-3 bg-[#F7F7F7] text-[#333333] italic font-mono text-sm">$1</blockquote>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#111111]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre class="bg-[#F7F7F7] p-3 my-3 border border-[#E5E5E5] font-mono text-xs text-[#111111] overflow-x-auto"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] px-1.5 py-0.5 font-mono text-xs">$1</code>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-[#333333] text-sm">$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-3 text-sm text-[#333333] leading-relaxed">');

    return `<p class="mb-3 text-sm text-[#333333] leading-relaxed">${html}</p>`;
  };

  return (
    <div className="border border-[#E5E5E5] bg-white rounded-none overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-[#F7F7F7] border-b border-[#E5E5E5]">
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => insertFormat('## ', '', 'Heading 2')}
            className="px-2 py-1 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] flex items-center gap-1 font-bold cursor-pointer"
            title="Heading 2"
          >
            <Heading1 className="w-3.5 h-3.5" /> H2
          </button>
          <button
            type="button"
            onClick={() => insertFormat('### ', '', 'Heading 3')}
            className="px-2 py-1 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] flex items-center gap-1 font-bold cursor-pointer"
            title="Heading 3"
          >
            <Heading2 className="w-3.5 h-3.5" /> H3
          </button>

          <div className="h-4 w-px bg-[#E5E5E5] mx-1" />

          <button
            type="button"
            onClick={() => insertFormat('**', '**', 'bold text')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('*', '*', 'italic text')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[#E5E5E5] mx-1" />

          <button
            type="button"
            onClick={() => insertFormat('- ', '', 'List item')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('1. ', '', 'Numbered item')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('> ', '', 'Quoted insight')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('```\n', '\n```', '// Code snippet')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[#E5E5E5] mx-1" />

          <button
            type="button"
            onClick={() => insertFormat('[', '](https://example.com)', 'Link Title')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Add Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('![Image Caption](', ')', 'https://images.unsplash.com/...')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Add Image"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
            title="Insert Table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('\n---\n')}
            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-white border border-transparent hover:border-[#E5E5E5] cursor-pointer"
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
              ? 'bg-[#111111] text-white border-[#111111] font-bold'
              : 'bg-white text-[#555555] hover:text-[#111111] border-[#E5E5E5]'
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
          className="p-6 bg-white min-h-[300px] max-h-[500px] overflow-y-auto font-sans max-w-none text-xs leading-relaxed text-[#111111]"
          dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(value) }}
        />
      ) : (
        <textarea
          id="rich-editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={14}
          className="w-full p-4 bg-white text-[#111111] font-mono text-xs leading-relaxed focus:outline-none resize-y min-h-[350px]"
        />
      )}
    </div>
  );
}
