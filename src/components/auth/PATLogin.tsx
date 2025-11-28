import { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { Key, X, ExternalLink, Info } from 'lucide-react';

interface PATLoginProps {
  onClose: () => void;
}

export default function PATLogin({ onClose }: PATLoginProps) {
  const [token, setToken] = useState('');
  const { loginWithPAT, isLoading, error, clearError } = useAuthStore();
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    try {
      await loginWithPAT(token.trim());
      onClose();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-6 h-6 text-github-accent" />
            <h2 className="text-2xl font-bold">Sign in with Personal Access Token</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-github-muted hover:text-github-text transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-github-dark/50 border border-github-border rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-github-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-github-muted space-y-2">
              <p>
                <strong className="text-github-text">Why Personal Access Token?</strong>
              </p>
              <p>
                Due to browser security (CORS), we cannot use OAuth directly from GitHub Pages.
                Using a PAT allows the app to work immediately without a backend server.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">How to create a PAT:</h3>
            <ol className="list-decimal list-inside space-y-2 text-github-muted">
              <li>
                Go to{' '}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link inline-flex items-center gap-1"
                >
                  GitHub Settings → Developer Settings → Personal Access Tokens
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Click "Generate new token" → "Generate new token (classic)"</li>
              <li>Give it a descriptive name (e.g., "Telescope App")</li>
              <li>
                Select scopes:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li><code className="text-xs bg-github-dark px-1 py-0.5 rounded">user</code> - Read user profile</li>
                  <li><code className="text-xs bg-github-dark px-1 py-0.5 rounded">repo</code> - Access repositories</li>
                  <li><code className="text-xs bg-github-dark px-1 py-0.5 rounded">read:org</code> - Read organization data</li>
                </ul>
              </li>
              <li>Click "Generate token" and copy it immediately</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pat-token" className="block text-sm font-medium mb-2">
                Paste your token here:
              </label>
              <div className="relative">
                <input
                  id="pat-token"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="input pr-20 font-mono text-sm"
                  disabled={isLoading}
                  autoFocus
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-github-muted hover:text-github-text transition-colors"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading || !token.trim()}
                className="btn-primary flex-1"
              >
                {isLoading ? 'Validating...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="text-xs text-github-muted bg-github-dark/30 border border-github-border rounded p-3">
          <p>
            <strong>Security Note:</strong> Your token is stored only in your browser's session storage
            and is never sent to any server except GitHub's API. It will be cleared when you close the tab.
          </p>
        </div>
      </div>
    </div>
  );
}
