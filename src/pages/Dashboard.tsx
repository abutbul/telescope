import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useUserStore } from '../stores/user-store';
import { Calendar, GitBranch, Star, Code } from 'lucide-react';
import { formatDistance } from 'date-fns';

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const { user, repos, stats, isLoading, fetchUser, fetchRepos, fetchStats } = useUserStore();

  useEffect(() => {
    if (token) {
      fetchUser(token);
      fetchRepos(token);
      fetchStats(token);
    }
  }, [token, fetchUser, fetchRepos, fetchStats]);

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-github-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card">
        <p className="text-github-muted">Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Profile */}
      <div className="card">
        <div className="flex items-start gap-6">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-24 h-24 rounded-full border-2 border-github-border"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name || user.login}</h1>
            <p className="text-github-muted mb-4">@{user.login}</p>
            {user.bio && <p className="text-github-text mb-4">{user.bio}</p>}
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-bold">{user.public_repos}</span>{' '}
                <span className="text-github-muted">repositories</span>
              </div>
              <div>
                <span className="font-bold">{user.followers}</span>{' '}
                <span className="text-github-muted">followers</span>
              </div>
              <div>
                <span className="font-bold">{user.following}</span>{' '}
                <span className="text-github-muted">following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <Calendar className="w-8 h-8 text-github-accent mb-2" />
            <div className="text-2xl font-bold mb-1">{stats.accountAge} days</div>
            <div className="text-sm text-github-muted">
              Account Age ({formatDistance(new Date(user.created_at), new Date())} old)
            </div>
          </div>

          <div className="card">
            <GitBranch className="w-8 h-8 text-github-accent mb-2" />
            <div className="text-2xl font-bold mb-1">{stats.totalRepos}</div>
            <div className="text-sm text-github-muted">Total Repositories</div>
          </div>

          <div className="card">
            <Star className="w-8 h-8 text-github-accent mb-2" />
            <div className="text-2xl font-bold mb-1">{stats.totalStars}</div>
            <div className="text-sm text-github-muted">Total Stars Received</div>
          </div>

          <div className="card">
            <Code className="w-8 h-8 text-github-accent mb-2" />
            <div className="text-2xl font-bold mb-1">{stats.primaryLanguage}</div>
            <div className="text-sm text-github-muted">Primary Language</div>
          </div>
        </div>
      )}

      {/* Language Stats */}
      {stats && Object.keys(stats.languageStats).length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Languages</h2>
          <div className="space-y-3">
            {Object.entries(stats.languageStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([language, count]) => (
                <div key={language} className="flex items-center justify-between">
                  <span className="text-github-text">{language}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-2 bg-github-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-github-accent"
                        style={{
                          width: `${(count / stats.totalRepos) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-github-muted text-sm w-12 text-right">
                      {count} repos
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Repositories */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Recent Repositories</h2>
        <div className="space-y-4">
          {repos
            .slice()
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5)
            .map((repo) => (
              <div key={repo.id} className="border-l-2 border-github-accent pl-4">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link text-lg font-semibold"
                >
                  {repo.name}
                </a>
                {repo.description && (
                  <p className="text-github-muted text-sm mt-1">{repo.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-github-muted">
                  {repo.language && <span>{repo.language}</span>}
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>
                    Updated {formatDistance(new Date(repo.updated_at), new Date())} ago
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
