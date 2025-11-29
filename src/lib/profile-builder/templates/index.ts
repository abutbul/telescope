import { ProfileTemplate, PortfolioTemplate, AnyTemplate, isPortfolioTemplate, isReadmeTemplate } from '../types';
import { developerCardTemplate } from './developer-card';
import { statsDashboardTemplate } from './stats-dashboard';
import { minimalistTemplate } from './minimalist';
import { modernPortfolioTemplate } from './portfolio-modern';
import { minimalPortfolioTemplate, creativePortfolioTemplate } from './portfolio-variants';

// README profile templates
export const readmeTemplates: ProfileTemplate[] = [
  developerCardTemplate,
  statsDashboardTemplate,
  minimalistTemplate,
];

// Portfolio website templates
export const portfolioTemplates: PortfolioTemplate[] = [
  modernPortfolioTemplate,
  minimalPortfolioTemplate,
  creativePortfolioTemplate,
];

// All templates combined
export const allTemplates: AnyTemplate[] = [
  ...readmeTemplates,
  ...portfolioTemplates,
];

export function getTemplateById(id: string): AnyTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}

export function getReadmeTemplateById(id: string): ProfileTemplate | undefined {
  return readmeTemplates.find((t) => t.id === id);
}

export function getPortfolioTemplateById(id: string): PortfolioTemplate | undefined {
  return portfolioTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): AnyTemplate[] {
  return allTemplates.filter((t) => t.category === category);
}

export function getTemplatesByMode(mode: 'readme' | 'portfolio'): AnyTemplate[] {
  if (mode === 'readme') {
    return readmeTemplates;
  }
  return portfolioTemplates;
}

export function searchTemplates(query: string): AnyTemplate[] {
  const lowerQuery = query.toLowerCase();
  return allTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)),
  );
}

// Re-export type guards
export { isPortfolioTemplate, isReadmeTemplate };
