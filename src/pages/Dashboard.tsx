import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useUserStore } from '../stores/user-store';
import { 
  Calendar, GitBranch, Star, Code, Users, UserCheck, UserX, 
  Clock, Moon, Sun, Flame, TrendingUp, FileCode, Activity,
  Sparkles, Coffee, Zap, Heart
} from 'lucide-react';
import { formatDistance, format } from 'date-fns';

// Language colors (GitHub-style)
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Dart: '#00B4AB',
  Lua: '#000080',
  R: '#198CE7',
  Julia: '#a270ba',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Haskell: '#5e5086',
  OCaml: '#3be133',
  Perl: '#0298c3',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  default: '#8b949e',
};

function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || LANGUAGE_COLORS.default;
}

// Helper to format hour as human readable
function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

// Get coder personality based on commit patterns
function getCoderPersonality(commitStats: {
  weekendWarrior: boolean;
  nightOwl: boolean;
  earlyBird: boolean;
  mostActiveDay: string;
  mostActiveHour: number;
  averageCommitsPerDay: number;
}): { title: string; emoji: string; description: string } {
  if (commitStats.nightOwl) {
    return { 
      title: 'Night Owl', 
      emoji: '🦉', 
      description: 'You do your best work when the world sleeps' 
    };
  }
  if (commitStats.earlyBird) {
    return { 
      title: 'Early Bird', 
      emoji: '🐦', 
      description: 'Catching bugs before breakfast!' 
    };
  }
  if (commitStats.weekendWarrior) {
    return { 
      title: 'Weekend Warrior', 
      emoji: '⚔️', 
      description: 'Weekends are for side projects' 
    };
  }
  if (commitStats.averageCommitsPerDay > 5) {
    return { 
      title: 'Commit Machine', 
      emoji: '🤖', 
      description: 'Your commit graph is always green' 
    };
  }
  if (commitStats.mostActiveDay === 'Friday') {
    return { 
      title: 'TGIF Coder', 
      emoji: '🎉', 
      description: 'Shipping features to celebrate the weekend' 
    };
  }
  if (commitStats.mostActiveDay === 'Monday') {
    return { 
      title: 'Monday Motivator', 
      emoji: '💪', 
      description: 'Starting the week strong!' 
    };
  }
  return { 
    title: 'Balanced Developer', 
    emoji: '⚖️', 
    description: 'Maintaining a healthy work-life balance' 
  };
}

// Mini bar chart component
function MiniBarChart({ data, maxValue }: { data: Record<string, number>; maxValue: number }) {
  const entries = Object.entries(data);
  return (
    <div className="flex items-end gap-1 h-16">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col items-center flex-1">
          <div 
            className="w-full bg-github-accent rounded-t transition-all hover:bg-blue-400"
            style={{ height: `${Math.max((value / maxValue) * 100, 4)}%` }}
            title={`${key}: ${value} commits`}
          />
          <span className="text-[10px] text-github-muted mt-1">{key.slice(0, 2)}</span>
        </div>
      ))}
    </div>
  );
}

// Hour distribution chart
function HourChart({ data }: { data: Record<number, number> }) {
  const maxValue = Math.max(...Object.values(data), 1);
  return (
    <div className="flex items-end gap-px h-12">
      {Array.from({ length: 24 }, (_, hour) => (
        <div 
          key={hour}
          className="flex-1 bg-github-accent rounded-t transition-all hover:bg-blue-400 cursor-pointer"
          style={{ height: `${Math.max((data[hour] / maxValue) * 100, 2)}%` }}
          title={`${formatHour(hour)}: ${data[hour]} commits`}
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const { 
    user, repos, stats, dashboardData, 
    isLoading, isLoadingDashboard,
    fetchUser, fetchRepos, fetchStats, fetchDashboardData 
  } = useUserStore();

  useEffect(() => {
    if (token) {
      fetchUser(token);
    }
  }, [token, fetchUser]);

  useEffect(() => {
    if (token && user?.login) {
      fetchRepos(token);
      fetchStats(token);
      fetchDashboardData(token);
    }
  }, [token, user?.login, fetchRepos, fetchStats, fetchDashboardData]);

  const coderPersonality = useMemo(() => {
    if (!dashboardData?.commitStats) return null;
    return getCoderPersonality(dashboardData.commitStats);
  }, [dashboardData?.commitStats]);

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
          {/* Coder Personality Badge */}
          {coderPersonality && (
            <div className="hidden lg:block bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
              <div className="text-4xl mb-2">{coderPersonality.emoji}</div>
              <div className="text-sm font-semibold text-purple-300">{coderPersonality.title}</div>
              <div className="text-xs text-github-muted mt-1">{coderPersonality.description}</div>
            </div>
          )}
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

      {/* Followback Metrics */}
      {dashboardData && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-github-accent" />
            Network Insights
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-github-dimmed rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="text-sm text-github-muted">Followback Rate</span>
              </div>
              <div className="text-3xl font-bold text-pink-400">
                {dashboardData.followbackRate.toFixed(1)}%
              </div>
              <div className="text-xs text-github-muted mt-1">
                of people you follow, follow you back
              </div>
            </div>
            
            <div className="bg-github-dimmed rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-green-400" />
                <span className="text-sm text-github-muted">Mutual Follows</span>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {dashboardData.mutualFollows}
              </div>
              <div className="text-xs text-github-muted mt-1">
                friends who follow each other
              </div>
            </div>
            
            <div className="bg-github-dimmed rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-github-muted">Fans</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400">
                {dashboardData.followersNotFollowingBack}
              </div>
              <div className="text-xs text-github-muted mt-1">
                followers you don't follow back
              </div>
            </div>
            
            <div className="bg-github-dimmed rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserX className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-github-muted">Unrequited</span>
              </div>
              <div className="text-3xl font-bold text-orange-400">
                {dashboardData.followingNotFollowedBack}
              </div>
              <div className="text-xs text-github-muted mt-1">
                following who don't follow back
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commit Activity Analysis */}
      {dashboardData?.commitStats && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-github-accent" />
            Commit Patterns
            {isLoadingDashboard && <span className="text-sm text-github-muted font-normal">(analyzing...)</span>}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-github-dimmed rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-github-muted">Current Streak</span>
              </div>
              <div className="text-3xl font-bold text-orange-500">
                {dashboardData.commitStats.streakDays} days
              </div>
            </div>
            
            <div className="bg-github-dimmed rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-github-muted">Longest Streak</span>
              </div>
              <div className="text-3xl font-bold text-green-500">
                {dashboardData.commitStats.longestStreak} days
              </div>
            </div>
            
            <div className="bg-github-dimmed rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-github-muted">Peak Hour</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {formatHour(dashboardData.commitStats.mostActiveHour)}
              </div>
              <div className="text-xs text-github-muted mt-1">
                {dashboardData.commitStats.nightOwl && <span className="flex items-center gap-1"><Moon className="w-3 h-3" /> Night owl detected</span>}
                {dashboardData.commitStats.earlyBird && <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Early bird detected</span>}
              </div>
            </div>
            
            <div className="bg-github-dimmed rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-github-muted">Most Active Day</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {dashboardData.commitStats.mostActiveDay}
              </div>
              <div className="text-xs text-github-muted mt-1">
                {dashboardData.commitStats.weekendWarrior && <span className="flex items-center gap-1"><Coffee className="w-3 h-3" /> Weekend warrior!</span>}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-github-dimmed rounded-lg p-4">
              <h3 className="text-sm font-semibold text-github-muted mb-3">Commits by Day of Week</h3>
              <MiniBarChart 
                data={dashboardData.commitStats.commitsByDayOfWeek}
                maxValue={Math.max(...Object.values(dashboardData.commitStats.commitsByDayOfWeek), 1)}
              />
            </div>
            
            <div className="bg-github-dimmed rounded-lg p-4">
              <h3 className="text-sm font-semibold text-github-muted mb-3">Commits by Hour (24h)</h3>
              <HourChart data={dashboardData.commitStats.commitsByHour} />
              <div className="flex justify-between text-[10px] text-github-muted mt-1">
                <span>12AM</span>
                <span>6AM</span>
                <span>12PM</span>
                <span>6PM</span>
                <span>12AM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recently Updated Starred Repos */}
      {dashboardData && dashboardData.recentlyUpdatedStarredRepos.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Active Starred Repos
          </h2>
          <p className="text-github-muted text-sm mb-4">
            Your starred repositories that were recently updated
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {dashboardData.recentlyUpdatedStarredRepos.slice(0, 6).map((star) => (
              <a
                key={star.repo.id}
                href={star.repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-github-dimmed rounded-lg hover:bg-github-border transition-colors group"
              >
                {star.repo.owner && (
                  <img
                    src={star.repo.owner.avatar_url}
                    alt={star.repo.owner.login}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-github-fg group-hover:text-github-accent truncate">
                    {star.repo.full_name}
                  </div>
                  <div className="text-xs text-github-muted flex items-center gap-2">
                    {star.repo.language && <span>{star.repo.language}</span>}
                    <span>⭐ {star.repo.stargazers_count}</span>
                    <span>Updated {formatDistance(new Date(star.repo.updated_at), new Date())} ago</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Two-column: Gists from Network + Languages */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gists from Followed Users */}
        {dashboardData && dashboardData.followedUsersGists.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-400" />
              Network Gists
            </h2>
            <p className="text-github-muted text-xs mb-3">
              Recent snippets from people you follow
            </p>
            <div className="space-y-2">
              {dashboardData.followedUsersGists.slice(0, 5).map((gist) => (
                <a
                  key={gist.id}
                  href={gist.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-github-dimmed rounded-lg hover:bg-github-border transition-colors group"
                >
                  <img
                    src={gist.owner.avatar_url}
                    alt={gist.owner.login}
                    className="w-6 h-6 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-github-fg group-hover:text-github-accent truncate">
                      {gist.description || Object.keys(gist.files)[0] || 'Untitled Gist'}
                    </div>
                    <div className="text-[10px] text-github-muted flex items-center gap-1">
                      <span>@{gist.owner.login}</span>
                      <span>•</span>
                      <span>{format(new Date(gist.updated_at), 'MMM d')}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Language Stats - Compact with colored bars */}
        {stats && Object.keys(stats.languageStats).length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-github-accent" />
              Languages
            </h2>
            {/* Stacked bar showing all languages */}
            <div className="mb-4">
              <div className="h-3 rounded-full overflow-hidden flex">
                {Object.entries(stats.languageStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([language, count]) => (
                    <div
                      key={language}
                      className="h-full transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        width: `${(count / stats.totalRepos) * 100}%`,
                        backgroundColor: getLanguageColor(language),
                      }}
                      title={`${language}: ${count} repos (${((count / stats.totalRepos) * 100).toFixed(1)}%)`}
                    />
                  ))}
              </div>
            </div>
            {/* Language list with colored dots */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(stats.languageStats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([language, count]) => (
                  <div key={language} className="flex items-center gap-2 text-sm py-1">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getLanguageColor(language) }}
                    />
                    <span className="text-github-text truncate flex-1">{language}</span>
                    <span className="text-github-muted text-xs">
                      {((count / stats.totalRepos) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

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

      {/* Loading indicator for dashboard data */}
      {isLoadingDashboard && !dashboardData && (
        <div className="card flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-github-accent border-t-transparent rounded-full"></div>
            <p className="text-github-muted">Loading additional insights...</p>
          </div>
        </div>
      )}
    </div>
  );
}
