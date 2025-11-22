import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useStarsStore } from '../stores/stars-store';
import { Search, Star, Check } from 'lucide-react';

export default function StarsPage() {
  const token = useAuthStore((state) => state.token);
  const {
    myStars,
    targetUserStars,
    targetUsername,
    isLoading,
    copyProgress,
    fetchMyStars,
    fetchUserStars,
    copyStarsFromUser,
    clearTargetUser,
  } = useStarsStore();

  const [searchUsername, setSearchUsername] = useState('');
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (token) {
      fetchMyStars(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSearch = async () => {
    if (!token || !searchUsername) return;
    await fetchUserStars(token, searchUsername);
  };

  const handleSelectRepo = (fullName: string) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(fullName)) {
      newSelected.delete(fullName);
    } else {
      newSelected.add(fullName);
    }
    setSelectedRepos(newSelected);
  };

  const handleCopyStars = async () => {
    if (!token || selectedRepos.size === 0) return;

    const reposToCopy = targetUserStars
      .map((s) => s.repo)
      .filter((repo) => selectedRepos.has(repo.full_name));

    await copyStarsFromUser(token, reposToCopy);
    setSelectedRepos(new Set());
    fetchMyStars(token, true);
  };

  const myStarredRepoNames = new Set(myStars.map((s) => s.repo.full_name));

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">Star Management</h1>
        <p className="text-github-muted mb-6">
          You have <span className="text-github-accent font-bold">{myStars.length}</span> starred
          repositories
        </p>

        {/* Search for user */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter GitHub username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input flex-1"
          />
          <button onClick={handleSearch} disabled={isLoading} className="btn-primary">
            <Search className="w-5 h-5 inline mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Copy Progress */}
      {copyProgress.inProgress && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Copying Stars...</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Progress: {copyProgress.completed} / {copyProgress.total}
              </span>
              {copyProgress.failed > 0 && (
                <span className="text-github-danger">Failed: {copyProgress.failed}</span>
              )}
            </div>
            <div className="w-full h-2 bg-github-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-github-accent transition-all"
                style={{
                  width: `${(copyProgress.completed / copyProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Target User Stars */}
      {targetUsername && targetUserStars.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {targetUsername}'s Stars ({targetUserStars.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopyStars}
                disabled={selectedRepos.size === 0 || copyProgress.inProgress}
                className="btn-primary"
              >
                <Star className="w-4 h-4 inline mr-2" />
                Copy {selectedRepos.size} Selected
              </button>
              <button onClick={clearTargetUser} className="btn-secondary">
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {targetUserStars.map((star) => {
              const repo = star.repo;
              const isAlreadyStarred = myStarredRepoNames.has(repo.full_name);
              const isSelected = selectedRepos.has(repo.full_name);

              return (
                <div
                  key={repo.id}
                  onClick={() => !isAlreadyStarred && handleSelectRepo(repo.full_name)}
                  className={`p-4 border border-github-border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-github-accent/10 border-github-accent'
                      : isAlreadyStarred
                      ? 'bg-github-dimmed/50 cursor-not-allowed opacity-50'
                      : 'hover:bg-github-dimmed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link text-lg font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {repo.full_name}
                        </a>
                        {isAlreadyStarred && (
                          <span className="text-xs bg-github-success/20 text-github-success px-2 py-1 rounded">
                            Already Starred
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-github-muted text-sm mt-1">{repo.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-github-muted">
                        {repo.language && <span>{repo.language}</span>}
                        <span>⭐ {repo.stargazers_count}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isAlreadyStarred ? (
                        <Check className="w-6 h-6 text-github-success" />
                      ) : isSelected ? (
                        <Check className="w-6 h-6 text-github-accent" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-github-border rounded" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
