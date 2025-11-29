import { useEffect } from 'react';
import { Radio, Grid, Sparkles, Eye, Save, Upload, FileText, Globe } from 'lucide-react';
import { useProfileBuilderStore } from '../stores/profile-builder-store';
import { useUserStore } from '../stores/user-store';
import { isPortfolioTemplate } from '../lib/profile-builder/types';
import TemplateGallery from '../components/profile-builder/TemplateGallery';
import TemplateCustomizer from '../components/profile-builder/TemplateCustomizer';
import PortfolioCustomizer from '../components/profile-builder/PortfolioCustomizer';

export default function ProfileBuilder() {
  const user = useUserStore((state) => state.user);
  const {
    selectedTemplate,
    isDirty,
    isDeploying,
    deployError,
    editorMode,
    builderMode,
    setBuilderMode,
    setEditorMode,
    generatePreview,
    checkProfileRepoStatus,
    checkPortfolioRepoStatus,
    deployToGitHub,
    deployPortfolioToGitHub,
  } = useProfileBuilderStore();

  useEffect(() => {
    if (user) {
      checkProfileRepoStatus();
    }
  }, [user, checkProfileRepoStatus]);

  const handleDeploy = async () => {
    try {
      if (selectedTemplate && isPortfolioTemplate(selectedTemplate)) {
        await deployPortfolioToGitHub();
        alert('✨ Portfolio deployed successfully! It may take a few minutes for GitHub Pages to update.');
      } else {
        await deployToGitHub();
        alert('✨ Profile deployed successfully!');
      }
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
            <p className="text-gray-400 mb-6">
              Create a stunning GitHub presence with beautiful templates
            </p>

            {/* Mode Selector */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setBuilderMode('readme')}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  builderMode === 'readme'
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <FileText className={`h-8 w-8 mb-3 ${builderMode === 'readme' ? 'text-blue-400' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${builderMode === 'readme' ? 'text-white' : 'text-gray-300'}`}>
                  Profile README
                </h3>
                <p className="text-sm text-gray-400">
                  Edit and publish your GitHub profile README (username/username repository). 
                  Great for a quick, eye-catching GitHub profile.
                </p>
              </button>

              <button
                onClick={() => setBuilderMode('portfolio')}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  builderMode === 'portfolio'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <Globe className={`h-8 w-8 mb-3 ${builderMode === 'portfolio' ? 'text-purple-400' : 'text-gray-500'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${builderMode === 'portfolio' ? 'text-white' : 'text-gray-300'}`}>
                  Portfolio Website
                </h3>
                <p className="text-sm text-gray-400">
                  Build a complete portfolio website with multiple pages, deployed via GitHub Pages. 
                  Perfect for showcasing your full professional profile.
                </p>
              </button>
            </div>
          </div>

          {/* Template Gallery */}
          <TemplateGallery />
        </div>
      </div>
    );
  }

  const isPortfolio = isPortfolioTemplate(selectedTemplate);

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
              <div className="flex items-center gap-2">
                {isPortfolio ? (
                  <Globe className="h-5 w-5 text-purple-400" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-400" />
                )}
                <h2 className="text-lg font-semibold text-white">{selectedTemplate.name}</h2>
              </div>
              {isDirty && <span className="text-xs text-orange-400">• Unsaved changes</span>}
            </div>

            <div className="flex items-center gap-2">
              {/* Editor Mode Selector - Only for README mode */}
              {!isPortfolio && (
                <>
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
                </>
              )}

              {/* Actions */}
              {!isPortfolio && (
                <button
                  onClick={generatePreview}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
              )}

              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className={`px-4 py-2 ${
                  isPortfolio ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-2`}
              >
                {isDeploying ? (
                  <>
                    <Save className="h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {isPortfolio ? 'Deploy to GitHub Pages' : 'Deploy to GitHub'}
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
      {isPortfolio ? <PortfolioCustomizer /> : <TemplateCustomizer />}
    </div>
  );
}
