import { useProfileBuilderStore } from '../../stores/profile-builder-store';
import CustomizationForm from './CustomizationForm';
import MarkdownEditor from './MarkdownEditor';
import LivePreview from './LivePreview';

export default function TemplateCustomizer() {
  const { editorMode } = useProfileBuilderStore();

  if (editorMode === 'form') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CustomizationForm />
          <LivePreview />
        </div>
      </div>
    );
  }

  if (editorMode === 'code') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MarkdownEditor />
          <LivePreview />
        </div>
      </div>
    );
  }

  // Split mode
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CustomizationForm />
        <MarkdownEditor />
        <LivePreview />
      </div>
    </div>
  );
}
