'use client';

import { useCallback, useMemo, useEffect, useRef } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { StreamLanguage } from '@codemirror/language';
import {
  EditorView,
  Decoration,
  type DecorationSet,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { highlightSelectionMatches } from '@codemirror/search';
import { RangeSetBuilder } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { Format } from '@/lib/converters';

const darkTheme = EditorView.theme(
  {
    '&': { backgroundColor: 'transparent' },
    '.cm-gutters': { backgroundColor: 'transparent', border: 'none', paddingRight: '4px' },
    '.cm-gutter': { color: 'rgba(255,255,255,0.2)' },
    '.cm-activeLineGutter': { background: 'transparent', color: 'rgba(255,255,255,0.45)' },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.025)' },
    '.cm-selectionBackground': { backgroundColor: 'rgba(255,255,255,0.1) !important' },
    '.cm-cursor': { borderLeftColor: '#fff', borderLeftWidth: '1.5px' },
    '.cm-content': { color: 'rgba(255,255,255,0.75)', caretColor: '#fff' },
    '.cm-line': {},
    '.cm-placeholder': { color: 'rgba(255,255,255,0.22)' },
    '.cm-matchingBracket': { backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' },
    '.cm-foldGutter': { color: 'rgba(255,255,255,0.2)' },
    '.cm-custom-search-match': {
      backgroundColor: 'rgba(140, 200, 232, 0.18)',
      borderRadius: '2px',
      outline: '1px solid rgba(140, 200, 232, 0.25)',
    },
    '.cm-custom-search-match-active': {
      backgroundColor: 'rgba(245, 166, 35, 0.4)',
      borderRadius: '2px',
      outline: '1px solid rgba(245, 166, 35, 0.6)',
      boxShadow: '0 0 8px rgba(245, 166, 35, 0.15)',
    },
    '.cm-selectionMatch': { backgroundColor: 'rgba(168, 212, 162, 0.15)' },
  },
  { dark: true }
);

const syntaxColors = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.string, color: '#a8d4a2' },
    { tag: tags.number, color: '#d4a87a' },
    { tag: tags.bool, color: '#d4a87a' },
    { tag: tags.null, color: '#d4a87a' },
    { tag: tags.keyword, color: '#c9a0dc' },
    { tag: tags.propertyName, color: '#8cc8e8' },
    { tag: tags.variableName, color: '#8cc8e8' },
    { tag: tags.operator, color: 'rgba(255,255,255,0.5)' },
    { tag: tags.punctuation, color: 'rgba(255,255,255,0.4)' },
    { tag: tags.bracket, color: 'rgba(255,255,255,0.45)' },
    { tag: tags.comment, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
    { tag: tags.atom, color: '#d4a87a' },
    { tag: tags.heading, color: '#c9a0dc' },
  ])
);

const tomlLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.match(/^#.*/)) return 'comment';
    if (stream.match(/^\[+[^\]]*\]+/)) return 'heading';
    if (stream.match(/^"(?:[^"\\]|\\.)*"/)) return 'string';
    if (stream.match(/^'(?:[^'\\]|\\.)*'/)) return 'string';
    if (stream.match(/^(true|false)\b/)) return 'atom';
    if (stream.match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/)) return 'number';
    if (stream.match(/^[a-zA-Z_][\w-]*/)) return 'variableName';
    if (stream.match(/^=/)) return 'operator';
    stream.next();
    return null;
  },
  startState() {
    return {};
  },
});

function getLanguageExtension(format: Format) {
  switch (format) {
    case 'json':
      return json();
    case 'yaml':
      return yaml();
    case 'toml':
      return tomlLanguage;
  }
}

const searchMark = Decoration.mark({ class: 'cm-custom-search-match' });
const searchMarkActive = Decoration.mark({ class: 'cm-custom-search-match-active' });

function createSearchHighlighter(query: string, activeIndex: number) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: any) {
        this.decorations = this.buildDecorations(view);
      }
      update(update: ViewUpdate) {
        this.decorations = this.buildDecorations(update.view);
      }
      buildDecorations(view: any): DecorationSet {
        if (!query) return Decoration.none;
        const builder = new RangeSetBuilder<Decoration>();
        const doc = view.state.doc.toString();
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try {
          const regex = new RegExp(escaped, 'gi');
          let match;
          let i = 0;
          while ((match = regex.exec(doc)) !== null) {
            builder.add(
              match.index,
              match.index + match[0].length,
              i === activeIndex ? searchMarkActive : searchMark
            );
            i++;
          }
        } catch {}
        return builder.finish();
      }
    },
    { decorations: v => v.decorations }
  );
}

type CodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  format: Format;
  readOnly?: boolean;
  placeholder?: string;
  searchQuery?: string;
  searchActiveIndex?: number;
};

export function CodeEditor({
  value,
  onChange,
  format,
  readOnly = false,
  placeholder,
  searchQuery = '',
  searchActiveIndex = 0,
}: CodeEditorProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange?.(val);
    },
    [onChange]
  );

  const searchExt = useMemo(
    () => (searchQuery ? createSearchHighlighter(searchQuery, searchActiveIndex) : []),
    [searchQuery, searchActiveIndex]
  );

  return (
    <div className="editor-wrapper h-full overflow-hidden rounded-xl bg-black/25">
      <CodeMirror
        value={value}
        onChange={handleChange}
        theme={darkTheme}
        extensions={[
          getLanguageExtension(format),
          syntaxColors,
          highlightSelectionMatches(),
          ...(Array.isArray(searchExt) ? searchExt : [searchExt]),
          EditorView.lineWrapping,
        ]}
        readOnly={readOnly}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          indentOnInput: true,
        }}
        style={{ height: '100%' }}
      />
    </div>
  );
}
