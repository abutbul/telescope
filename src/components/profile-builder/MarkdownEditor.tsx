import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Code2, Loader2 } from 'lucide-react';
import { useProfileBuilderStore } from '../../stores/profile-builder-store';

export default function MarkdownEditor() {
  const { previewMarkdown, setRawMarkdown } = useProfileBuilderStore();
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: unknown) {
    editorRef.current = editor as never;
  }

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setRawMarkdown(value);
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden h-[700px] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <Code2 className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Markdown Editor</h2>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={previewMarkdown}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full bg-gray-900">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
