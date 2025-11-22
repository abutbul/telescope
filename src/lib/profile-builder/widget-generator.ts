import { WidgetConfig, TelescopeStats } from './types';

export class WidgetGenerator {
  constructor(
    private username: string,
    private telescopeStats?: TelescopeStats,
  ) {}

  generate(config: WidgetConfig): string {
    switch (config.type) {
      case 'github-stats':
        return this.generateGitHubStats(config.options);
      case 'language-chart':
        return this.generateLanguageChart(config.options);
      case 'streak-stats':
        return this.generateStreakStats(config.options);
      case 'contribution-graph':
        return this.generateContributionGraph(config.options);
      case 'top-repos':
        return this.generateTopRepos(config.options);
      case 'tech-stack-badges':
        return this.generateTechStackBadges(config.options);
      case 'social-links':
        return this.generateSocialLinks(config.options);
      case 'activity-feed':
        return this.generateActivityFeed(config.options);
      case 'telescope-stats':
        return this.generateTelescopeStats();
      default:
        return '';
    }
  }

  private generateGitHubStats(options: Record<string, string | number | boolean | string[]>): string {
    const theme = options.theme || 'dark';
    const showIcons = options.showIcons !== false;
    const includeAllCommits = options.includeAllCommits !== false;
    const countPrivate = options.countPrivate !== false;
    const hideRank = options.hideRank === true;

    const params = new URLSearchParams({
      username: this.username,
      theme: theme as string,
      show_icons: showIcons.toString(),
      include_all_commits: includeAllCommits.toString(),
      count_private: countPrivate.toString(),
      hide_rank: hideRank.toString(),
    });

    return `<img src="https://github-readme-stats.vercel.app/api?${params.toString()}" alt="GitHub Stats" />`;
  }

  private generateLanguageChart(options: Record<string, string | number | boolean | string[]>): string {
    const theme = options.theme || 'dark';
    const layout = options.layout || 'compact';
    const hideProgress = options.hideProgress === true;

    const params = new URLSearchParams({
      username: this.username,
      theme: theme as string,
      layout: layout as string,
      hide_progress: hideProgress.toString(),
    });

    return `<img src="https://github-readme-stats.vercel.app/api/top-langs/?${params.toString()}" alt="Top Languages" />`;
  }

  private generateStreakStats(options: Record<string, string | number | boolean | string[]>): string {
    const theme = options.theme || 'dark';
    const hideBorder = options.hideBorder === true;

    const params = new URLSearchParams({
      user: this.username,
      theme: theme as string,
      hide_border: hideBorder.toString(),
    });

    return `<img src="https://github-readme-streak-stats.herokuapp.com/?${params.toString()}" alt="GitHub Streak" />`;
  }

  private generateContributionGraph(options: Record<string, string | number | boolean | string[]>): string {
    const theme = options.theme || 'github-dark';
    return `<img src="https://github-readme-activity-graph.vercel.app/graph?username=${this.username}&theme=${theme}" alt="Contribution Graph" />`;
  }

  private generateTopRepos(options: Record<string, string | number | boolean | string[]>): string {
    if (!this.telescopeStats?.topRepos) {
      return '<!-- No repository data available -->';
    }

    const limit = Math.min((options.limit as number) || 5, this.telescopeStats.topRepos.length);
    const repos = this.telescopeStats.topRepos.slice(0, limit);

    return repos
      .map((repo) => {
        return `- **[${repo.name}](${repo.url})** - ${repo.description || 'No description'} ${repo.language ? `• ${repo.language}` : ''} ⭐ ${repo.stars}`;
      })
      .join('\n');
  }

  private generateTechStackBadges(options: Record<string, string | number | boolean | string[]>): string {
    const style = (options.style as string) || 'flat';
    const theme = options.theme || 'dark';
    const languages = options.languages as string[] | undefined;

    // Use provided languages or infer from Telescope data
    const techs = languages || this.getTechnologiesFromTelescopeData();

    if (techs.length === 0) {
      return '<!-- No technology data available -->';
    }

    const badges = techs.map((tech) => {
      const badge = this.getTechnologyBadge(tech, style, theme as string);
      return badge;
    });

    return badges.join('\n');
  }

  private getTechnologiesFromTelescopeData(): string[] {
    if (!this.telescopeStats?.languageBreakdown) {
      return [];
    }

    // Return top languages
    return this.telescopeStats.languageBreakdown
      .slice(0, 10)
      .map((lang) => lang.name);
  }

  private getTechnologyBadge(tech: string, style: string, theme: string): string {
    const techMap: Record<string, { name: string; logo: string; color: string; logoColor?: string }> = {
      JavaScript: { name: 'JavaScript', logo: 'javascript', color: 'F7DF1E', logoColor: 'black' },
      TypeScript: { name: 'TypeScript', logo: 'typescript', color: '3178C6' },
      Python: { name: 'Python', logo: 'python', color: '3776AB' },
      Java: { name: 'Java', logo: 'openjdk', color: '007396' },
      'C++': { name: 'C++', logo: 'cplusplus', color: '00599C' },
      C: { name: 'C', logo: 'c', color: 'A8B9CC' },
      'C#': { name: 'C%23', logo: 'csharp', color: '239120' },
      Go: { name: 'Go', logo: 'go', color: '00ADD8' },
      Rust: { name: 'Rust', logo: 'rust', color: '000000' },
      Ruby: { name: 'Ruby', logo: 'ruby', color: 'CC342D' },
      PHP: { name: 'PHP', logo: 'php', color: '777BB4' },
      Swift: { name: 'Swift', logo: 'swift', color: 'FA7343' },
      Kotlin: { name: 'Kotlin', logo: 'kotlin', color: '7F52FF' },
      React: { name: 'React', logo: 'react', color: '61DAFB', logoColor: 'black' },
      Vue: { name: 'Vue.js', logo: 'vuedotjs', color: '4FC08D' },
      Angular: { name: 'Angular', logo: 'angular', color: 'DD0031' },
      'Node.js': { name: 'Node.js', logo: 'nodedotjs', color: '339933' },
      Express: { name: 'Express', logo: 'express', color: '000000' },
      Django: { name: 'Django', logo: 'django', color: '092E20' },
      Flask: { name: 'Flask', logo: 'flask', color: '000000' },
      Docker: { name: 'Docker', logo: 'docker', color: '2496ED' },
      Kubernetes: { name: 'Kubernetes', logo: 'kubernetes', color: '326CE5' },
      PostgreSQL: { name: 'PostgreSQL', logo: 'postgresql', color: '4169E1' },
      MongoDB: { name: 'MongoDB', logo: 'mongodb', color: '47A248' },
      Redis: { name: 'Redis', logo: 'redis', color: 'DC382D' },
      Git: { name: 'Git', logo: 'git', color: 'F05032' },
      AWS: { name: 'AWS', logo: 'amazonaws', color: '232F3E' },
      Linux: { name: 'Linux', logo: 'linux', color: 'FCC624', logoColor: 'black' },
    };

    const techInfo = techMap[tech] || { name: tech, logo: tech.toLowerCase(), color: '000000' };
    const logoColor = techInfo.logoColor || (theme === 'dark' ? 'white' : 'black');

    return `![${techInfo.name}](https://img.shields.io/badge/-${techInfo.name}-${techInfo.color}?style=${style}&logo=${techInfo.logo}&logoColor=${logoColor})`;
  }

  private generateSocialLinks(options: Record<string, string | number | boolean | string[]>): string {
    const style = (options.style as string) || 'flat';
    const links = options.links as unknown as Record<string, string> | undefined;

    if (!links || Object.keys(links).length === 0) {
      return '<!-- Add your social links in customization -->';
    }

    const socialBadges: Record<string, { name: string; logo: string; color: string }> = {
      linkedin: { name: 'LinkedIn', logo: 'linkedin', color: '0077B5' },
      twitter: { name: 'Twitter', logo: 'twitter', color: '1DA1F2' },
      email: { name: 'Email', logo: 'gmail', color: 'D14836' },
      website: { name: 'Website', logo: 'google-chrome', color: '4285F4' },
      medium: { name: 'Medium', logo: 'medium', color: '12100E' },
      dev: { name: 'Dev.to', logo: 'devdotto', color: '0A0A0A' },
      youtube: { name: 'YouTube', logo: 'youtube', color: 'FF0000' },
      instagram: { name: 'Instagram', logo: 'instagram', color: 'E4405F' },
    };

    return Object.entries(links)
      .map(([platform, url]) => {
        const badge = socialBadges[platform.toLowerCase()];
        if (!badge) return '';

        return `<a href="${url}"><img src="https://img.shields.io/badge/-${badge.name}-${badge.color}?style=${style}&logo=${badge.logo}&logoColor=white"/></a>`;
      })
      .filter(Boolean)
      .join('\n  ');
  }

  private generateActivityFeed(options: Record<string, string | number | boolean | string[]>): string {
    const theme = options.theme || 'github';
    return `![Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username=${this.username}&theme=${theme})`;
  }

  private generateTelescopeStats(): string {
    if (!this.telescopeStats) {
      return '<!-- Telescope stats not available -->';
    }

    const stats = this.telescopeStats;
    return `
### 📊 Telescope Analytics

- **Account Age**: ${stats.accountAge}
- **Total Repositories**: ${stats.totalRepos}
- **Total Stars**: ${stats.totalStars}
${stats.totalCommits ? `- **Total Commits**: ${stats.totalCommits}` : ''}
- **Primary Language**: ${stats.primaryLanguage}

#### Language Breakdown
${stats.languageBreakdown
  .slice(0, 5)
  .map((lang) => `- **${lang.name}**: ${lang.percentage.toFixed(1)}%`)
  .join('\n')}
`.trim();
  }
}
