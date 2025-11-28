import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Eye } from 'lucide-react';
import { useProfileBuilderStore } from '../../stores/profile-builder-store';

// Remove HTML comments from markdown for cleaner preview
function stripHtmlComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

export default function LivePreview() {
  const { previewMarkdown } = useProfileBuilderStore();

  // Clean the markdown by removing HTML comments
  const cleanMarkdown = stripHtmlComments(previewMarkdown);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden h-[700px] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <Eye className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Preview</h2>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-white">
        {cleanMarkdown ? (
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
            >
              {cleanMarkdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a template or start editing to see preview
          </div>
        )}
      </div>
    </div>
  );
}
