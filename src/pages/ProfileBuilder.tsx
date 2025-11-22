import { useEffect } from 'react';
import { Radio, Grid, Sparkles, Eye, Save, Upload } from 'lucide-react';
import { useProfileBuilderStore } from '../stores/profile-builder-store';
import { useUserStore } from '../stores/user-store';
import TemplateGallery from '../components/profile-builder/TemplateGallery';
import TemplateCustomizer from '../components/profile-builder/TemplateCustomizer';

export default function ProfileBuilder() {
  const user = useUserStore((state) => state.user);
  const {
    selectedTemplate,
    isDirty,
    isDeploying,
    deployError,
    editorMode,
    setEditorMode,
    generatePreview,
    checkProfileRepoStatus,
    deployToGitHub,
  } = useProfileBuilderStore();

  useEffect(() => {
    if (user) {
      checkProfileRepoStatus();
    }
  }, [user, checkProfileRepoStatus]);

  const handleDeploy = async () => {
    try {
      await deployToGitHub();
      alert('✨ Profile deployed successfully!');
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Profile Builder</h1>
            </div>
            <p className="text-gray-400">
              Create a stunning GitHub profile README with beautiful templates and dynamic widgets
            </p>
          </div>

          {/* Template Gallery */}
          <TemplateGallery />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => useProfileBuilderStore.getState().reset()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Templates
              </button>
              <div className="h-6 w-px bg-gray-800" />
              <h2 className="text-lg font-semibold text-white">{selectedTemplate.name}</h2>
              {isDirty && <span className="text-xs text-orange-400">• Unsaved changes</span>}
            </div>

            <div className="flex items-center gap-2">
              {/* Editor Mode Selector */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setEditorMode('form')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    editorMode === 'form'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="h-4 w-4 inline mr-1" />
                  Form
                </button>
                <button
                  onClick={() => setEditorMode('code')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    editorMode === 'code'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  Code
                </button>
                <button
                  onClick={() => setEditorMode('split')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    editorMode === 'split'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Split
                </button>
              </div>

              <div className="h-6 w-px bg-gray-800" />

              {/* Actions */}
              <button
                onClick={generatePreview}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>

              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isDeploying ? (
                  <>
                    <Save className="h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Deploy to GitHub
                  </>
                )}
              </button>
            </div>
          </div>

          {deployError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
              {deployError}
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <TemplateCustomizer />
    </div>
  );
}
