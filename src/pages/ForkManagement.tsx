import { useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { GitFork, RefreshCw, ExternalLink } from 'lucide-react';
import { GitHubAPI } from '../lib/github/api';

export default function ForkManagement() {
  const token = useAuthStore((state) => state.token);
  const [isForking, setIsForking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const REPO_OWNER = 'yourusername'; // Update with actual owner
  const REPO_NAME = 'telescope';

  const handleFork = async () => {
    if (!token) return;

    setIsForking(true);
    setMessage(null);

    try {
      const api = new GitHubAPI(token);
      const forkedRepo = await api.forkRepository(REPO_OWNER, REPO_NAME);

      setMessage({
        type: 'success',
        text: `Successfully forked to ${forkedRepo.full_name}. GitHub Pages will be automatically deployed!`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to fork repository',
      });
    } finally {
      setIsForking(false);
    }
  };

  const handleSync = async () => {
    if (!token) return;

    setIsSyncing(true);
    setMessage(null);

    try {
      const api = new GitHubAPI(token);
      const user = await api.getAuthenticatedUser();
      await api.syncFork(user.login, REPO_NAME);

      setMessage({
        type: 'success',
        text: 'Successfully synced with upstream repository!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to sync fork',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">Fork Management</h1>
        <p className="text-github-muted">
          Fork Telescope to your own account and maintain your self-hosted version with automatic
          GitHub Pages deployment.
        </p>
      </div>

      {message && (
        <div
          className={`card ${
            message.type === 'success'
              ? 'border-github-success'
              : 'border-github-danger'
          }`}
        >
          <p
            className={
              message.type === 'success'
                ? 'text-github-success'
                : 'text-github-danger'
            }
          >
            {message.text}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fork Repository */}
        <div className="card">
          <GitFork className="w-12 h-12 text-github-accent mb-4" />
          <h2 className="text-xl font-bold mb-2">Fork Repository</h2>
          <p className="text-github-muted mb-4">
            Create your own copy of Telescope. A GitHub Actions workflow will automatically deploy
            it to your GitHub Pages.
          </p>
          <button onClick={handleFork} disabled={isForking} className="btn-primary w-full">
            {isForking ? 'Forking...' : 'Fork to My Account'}
          </button>
        </div>

        {/* Sync Fork */}
        <div className="card">
          <RefreshCw className="w-12 h-12 text-github-accent mb-4" />
          <h2 className="text-xl font-bold mb-2">Sync Fork</h2>
          <p className="text-github-muted mb-4">
            Update your fork with the latest changes from the original repository. This merges
            upstream changes into your fork.
          </p>
          <button onClick={handleSync} disabled={isSyncing} className="btn-primary w-full">
            {isSyncing ? 'Syncing...' : 'Sync with Upstream'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Self-Hosting Instructions</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center font-bold">
              1
            </span>
            <div>
              <h4 className="font-bold mb-1">Fork the Repository</h4>
              <p className="text-github-muted">
                Click the "Fork to My Account" button above to create your copy.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center font-bold">
              2
            </span>
            <div>
              <h4 className="font-bold mb-1">Enable GitHub Pages</h4>
              <p className="text-github-muted">
                Go to your fork's Settings → Pages, and select "GitHub Actions" as the source.
                The workflow will automatically deploy.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center font-bold">
              3
            </span>
            <div>
              <h4 className="font-bold mb-1">Configure OAuth (Optional)</h4>
              <p className="text-github-muted">
                Create your own GitHub OAuth App at{' '}
                <a
                  href="https://github.com/settings/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  GitHub Settings <ExternalLink className="inline w-3 h-3" />
                </a>
                , then update the Client ID in your fork's code.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center font-bold">
              4
            </span>
            <div>
              <h4 className="font-bold mb-1">Keep Your Fork Updated</h4>
              <p className="text-github-muted">
                Use the "Sync with Upstream" button above to merge the latest features and bug
                fixes from the original repository.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
