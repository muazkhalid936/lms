"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import { Mark } from "@tiptap/core";
import { useRef, useState } from "react";

const FontSize = Mark.create({
  name: "fontSize",
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (el) => el.style.fontSize?.replace("px", "") || null,
        renderHTML: (attrs) =>
          attrs.size ? { style: `font-size:${attrs.size}px` } : {},
      },
    };
  },
  parseHTML() {
    return [
      { tag: "span", getAttrs: (el) => (el.style?.fontSize ? {} : false) },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain().setMark(this.name, { size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().unsetMark(this.name).run(),
    };
  },
});

export default function RichTextEditor({
  initialContent,
  onChange,
  sizes = [12, 13, 14, 15, 16, 18, 20, 24],
}) {
  const [currentSize, setCurrentSize] = useState(15);

  const fileRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      FontSize,
      Image,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.({
        html: editor.getHTML(),
        text: editor.getText(),
        json: editor.getJSON(),
      });
    },
    editorProps: {
      attributes: {
        class:
          // Tailwind classes for the editable area
          "tiptap prose prose-sm max-w-none min-h-[220px] p-4 outline-none resize-y overflow-auto",
      },
    },
    immediatelyRender: false, // SSR safety ✅
  });

  if (!editor) return null;

  const setSize = (px) => {
    editor.chain().focus().setFontSize(px).run();
    setCurrentSize(Number(editor.getAttributes("fontSize")?.size));
  };

  const insertImageFromFile = async (file) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    editor.chain().focus().setImage({ src: b64, alt: file.name }).run();
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-gray-200 bg-gray-50 p-2 sm:p-3 overflow-x-auto">
        {/* Font size dropdown */}
        <div className="relative flex-shrink-0">
          <select
            className="appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[60px]"
            value={currentSize}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <svg
              className="w-3 h-3 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Formatting buttons */}
        <div className="flex flex-row gap-1 sm:gap-2 flex-shrink-0">
          <ToolBtn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="B"
            title="Bold"
          />
          <ToolBtn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label={<span className="italic">I</span>}
            title="Italic"
          />
          <ToolBtn
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            label={<span className="underline">U</span>}
            title="Underline"
          />
          <ToolBtn
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            label={
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265L9.05 16.684a1 1 0 11-1.898-.632L11.05 3.684a1 1 0 011.266-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414L1.586 11.414a2 2 0 010-2.828L4.293 5.879a1 1 0 011.414 0zM14.293 6.293a1 1 0 011.414 0l2.707 2.707a2 2 0 010 2.828L15.707 14.535a1 1 0 11-1.414-1.414L16.586 11 14.293 8.707a1 1 0 010-1.414z"
                />
              </svg>
            }
            title="Inline code"
          />
          <ToolBtn
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            label={<span className="line-through">S</span>}
            title="Strikethrough"
          />

          {/* Image button */}
          <ToolBtn
            active={false}
            onClick={() => fileRef.current?.click()}
            label={
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            title="Insert image"
          />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => insertImageFromFile(e.target.files?.[0])}
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Grip bar */}
      <div className="relative h-4 border-t border-gray-200">
        <div className="absolute left-1/2 top-1/2 h-1 w-9 -translate-x-1/2 -translate-y-1/2 rounded bg-gray-300" />
      </div>
    </div>
  );
}

function ToolBtn({ active, onClick, label, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "group relative flex items-center justify-center w-10 h-10 border transition-all duration-200 font-bold text-base",
        active
          ? "bg-gray-900 border-gray-900 text-white transform scale-95"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm active:transform active:scale-95",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
