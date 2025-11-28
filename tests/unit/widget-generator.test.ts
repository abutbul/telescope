import { describe, it, expect } from 'vitest';
import { WidgetGenerator } from '../../src/lib/profile-builder/widget-generator';
import type { TelescopeStats } from '../../src/lib/profile-builder/types';

const mockStats: TelescopeStats = {
  accountAge: '2 years',
  totalRepos: 10,
  totalStars: 50,
  totalCommits: 100,
  primaryLanguage: 'TypeScript',
  languageBreakdown: [
    { name: 'TypeScript', percentage: 60, color: '#3178C6' },
    { name: 'JavaScript', percentage: 30, color: '#F7DF1E' },
    { name: 'Python', percentage: 10, color: '#3776AB' },
  ],
  topRepos: [
    {
      name: 'repo1',
      url: 'https://github.com/user/repo1',
      description: 'A cool repo',
      language: 'TypeScript',
      stars: 20,
      forks: 5,
      updatedAt: '2024-01-01',
    },
  ],
};

describe('WidgetGenerator', () => {
  const generator = new WidgetGenerator('testuser', mockStats);

  it('generates GitHub stats widget', () => {
    const result = generator.generate({
      id: '1',
      type: 'github-stats',
      enabled: true,
      options: { theme: 'dark', showIcons: true },
    });
    expect(result).toContain('github-readme-stats.vercel.app/api');
    expect(result).toContain('username=testuser');
    expect(result).toContain('theme=dark');
  });

  it('generates Language chart widget', () => {
    const result = generator.generate({
      id: '2',
      type: 'language-chart',
      enabled: true,
      options: { theme: 'light', layout: 'compact' },
    });
    expect(result).toContain('github-readme-stats.vercel.app/api/top-langs');
    expect(result).toContain('username=testuser');
    expect(result).toContain('layout=compact');
  });

  it('generates Streak stats widget', () => {
    const result = generator.generate({
      id: '3',
      type: 'streak-stats',
      enabled: true,
      options: { theme: 'dark' },
    });
    expect(result).toContain('github-readme-streak-stats.herokuapp.com');
    expect(result).toContain('user=testuser');
  });

  it('generates Contribution graph widget', () => {
    const result = generator.generate({
      id: '4',
      type: 'contribution-graph',
      enabled: true,
      options: { theme: 'github-dark' },
    });
    expect(result).toContain('github-readme-activity-graph.vercel.app/graph');
    expect(result).toContain('username=testuser');
  });

  it('generates Top repos widget', () => {
    const result = generator.generate({
      id: '5',
      type: 'top-repos',
      enabled: true,
      options: { limit: 3 },
    });
    expect(result).toContain('repo1');
    expect(result).toContain('A cool repo');
    expect(result).toContain('⭐ 20');
  });

  it('generates Tech stack badges widget', () => {
    const result = generator.generate({
      id: '6',
      type: 'tech-stack-badges',
      enabled: true,
      options: { style: 'flat' },
    });
    expect(result).toContain('TypeScript');
    expect(result).toContain('JavaScript');
    expect(result).toContain('Python');
    expect(result).toContain('img.shields.io/badge');
  });

  it('generates Social links widget', () => {
    const result = generator.generate({
      id: '7',
      type: 'social-links',
      enabled: true,
      options: {
        links: {
          twitter: 'https://twitter.com/testuser',
          linkedin: 'https://linkedin.com/in/testuser',
        },
      },
    });
    expect(result).toContain('twitter.com/testuser');
    expect(result).toContain('linkedin.com/in/testuser');
    expect(result).toContain('img.shields.io/badge');
  });

  it('generates Activity feed widget', () => {
    const result = generator.generate({
      id: '8',
      type: 'activity-feed',
      enabled: true,
      options: { theme: 'github' },
    });
    expect(result).toContain('github-readme-activity-graph.vercel.app/graph');
    expect(result).toContain('username=testuser');
  });

  it('generates Telescope stats widget', () => {
    const result = generator.generate({
      id: '9',
      type: 'telescope-stats',
      enabled: true,
      options: {},
    });
    expect(result).toContain('Telescope Analytics');
    expect(result).toContain('Account Age');
    expect(result).toContain('Total Repositories');
    expect(result).toContain('TypeScript');
  });

  it('returns empty string for unknown widget type', () => {
    const result = generator.generate({
      id: '10',
      // @ts-expect-error Testing invalid type
      type: 'unknown-type',
      enabled: true,
      options: {},
    });
    expect(result).toBe('');
  });

  it('handles missing stats gracefully', () => {
    const noStatsGenerator = new WidgetGenerator('testuser');
    
    const topRepos = noStatsGenerator.generate({
      id: '11',
      type: 'top-repos',
      enabled: true,
      options: {},
    });
    expect(topRepos).toContain('No repository data available');

    const telescopeStats = noStatsGenerator.generate({
      id: '12',
      type: 'telescope-stats',
      enabled: true,
      options: {},
    });
    expect(telescopeStats).toContain('Telescope stats not available');
  });
});
