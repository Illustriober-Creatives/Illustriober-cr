"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Describe the issue in detail...",
  minHeight = "160px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none prose prose-sm prose-invert max-w-none",
      },
    },
  });

  return (
    <div
      className="rounded-lg border border-glass-border bg-glass-bg px-4 py-3 focus-within:border-accent transition-colors cursor-text"
      style={{ minHeight }}
      onClick={() => editor?.chain().focus().run()}
    >
      <EditorContent editor={editor} />
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #52525b;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
