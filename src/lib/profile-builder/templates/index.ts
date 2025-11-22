import { ProfileTemplate } from '../types';
import { developerCardTemplate } from './developer-card';
import { statsDashboardTemplate } from './stats-dashboard';
import { minimalistTemplate } from './minimalist';

export const allTemplates: ProfileTemplate[] = [
  developerCardTemplate,
  statsDashboardTemplate,
  minimalistTemplate,
];

export function getTemplateById(id: string): ProfileTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): ProfileTemplate[] {
  return allTemplates.filter((t) => t.category === category);
}

export function searchTemplates(query: string): ProfileTemplate[] {
  const lowerQuery = query.toLowerCase();
  return allTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)),
  );
}
