import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye } from 'lucide-react';
import { useProfileBuilderStore } from '../../stores/profile-builder-store';

export default function LivePreview() {
  const { previewMarkdown } = useProfileBuilderStore();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden h-[700px] flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <Eye className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Preview</h2>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewMarkdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
