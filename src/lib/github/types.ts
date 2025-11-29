// GitHub API Types

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  owner?: {
    login: string;
    avatar_url: string;
  };
}

export interface StarredRepo {
  starred_at: string;
  repo: Repository;
}

export interface CommitActivity {
  days: number[];
  total: number;
  week: number;
}

export interface LanguageStats {
  [language: string]: number;
}

export interface AccountStats {
  totalCommits: number;
  totalStars: number;
  totalRepos: number;
  accountAge: number; // days
  primaryLanguage: string;
  languageStats: LanguageStats;
  commitsByDay: CommitActivity[];
  reposCreatedByMonth: Record<string, number>;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
}

export interface GitHubGist {
  id: string;
  html_url: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, {
    filename: string;
    language: string | null;
    size: number;
  }>;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
  };
  payload: {
    commits?: Array<{
      sha: string;
      message: string;
    }>;
    size?: number;
    action?: string;
  };
  created_at: string;
}

export interface CommitStats {
  totalCommits: number;
  commitsByDayOfWeek: Record<string, number>;
  commitsByHour: Record<number, number>;
  mostActiveDay: string;
  mostActiveHour: number;
  streakDays: number;
  longestStreak: number;
  commitDates: string[];
  averageCommitsPerDay: number;
  weekendWarrior: boolean; // More commits on weekends
  nightOwl: boolean; // Most commits after 10pm
  earlyBird: boolean; // Most commits before 9am
}
