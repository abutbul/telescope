import { describe, it, expect } from 'vitest';
import {
  readmeTemplates,
  portfolioTemplates,
  allTemplates,
  getTemplateById,
  getReadmeTemplateById,
  getPortfolioTemplateById,
  getTemplatesByCategory,
  getTemplatesByMode,
  searchTemplates,
  isPortfolioTemplate,
  isReadmeTemplate,
} from '../../src/lib/profile-builder/templates';

describe('Template Index', () => {
  describe('Template collections', () => {
    it('should export readme templates', () => {
      expect(readmeTemplates).toBeDefined();
      expect(readmeTemplates.length).toBeGreaterThan(0);
      expect(readmeTemplates.every((t) => t.mode === 'readme')).toBe(true);
    });

    it('should export portfolio templates', () => {
      expect(portfolioTemplates).toBeDefined();
      expect(portfolioTemplates.length).toBeGreaterThan(0);
      expect(portfolioTemplates.every((t) => t.mode === 'portfolio')).toBe(true);
    });

    it('should export all templates combined', () => {
      expect(allTemplates).toBeDefined();
      expect(allTemplates.length).toBe(readmeTemplates.length + portfolioTemplates.length);
    });
  });

  describe('getTemplateById', () => {
    it('should find a template by id', () => {
      const firstTemplate = allTemplates[0];
      const found = getTemplateById(firstTemplate.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstTemplate.id);
    });

    it('should return undefined for non-existent id', () => {
      const found = getTemplateById('non-existent-template-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getReadmeTemplateById', () => {
    it('should find a readme template by id', () => {
      const firstReadme = readmeTemplates[0];
      const found = getReadmeTemplateById(firstReadme.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstReadme.id);
      expect(found?.mode).toBe('readme');
    });

    it('should return undefined for portfolio template id', () => {
      const portfolioTemplate = portfolioTemplates[0];
      const found = getReadmeTemplateById(portfolioTemplate.id);
      expect(found).toBeUndefined();
    });

    it('should return undefined for non-existent id', () => {
      const found = getReadmeTemplateById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('getPortfolioTemplateById', () => {
    it('should find a portfolio template by id', () => {
      const firstPortfolio = portfolioTemplates[0];
      const found = getPortfolioTemplateById(firstPortfolio.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(firstPortfolio.id);
      expect(found?.mode).toBe('portfolio');
    });

    it('should return undefined for readme template id', () => {
      const readmeTemplate = readmeTemplates[0];
      const found = getPortfolioTemplateById(readmeTemplate.id);
      expect(found).toBeUndefined();
    });

    it('should return undefined for non-existent id', () => {
      const found = getPortfolioTemplateById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should filter templates by category', () => {
      const minimalistTemplates = getTemplatesByCategory('minimalist');
      expect(minimalistTemplates.every((t) => t.category === 'minimalist')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const templates = getTemplatesByCategory('non-existent-category');
      expect(templates).toEqual([]);
    });
  });

  describe('getTemplatesByMode', () => {
    it('should return readme templates for readme mode', () => {
      const templates = getTemplatesByMode('readme');
      expect(templates).toEqual(readmeTemplates);
      expect(templates.every((t) => t.mode === 'readme')).toBe(true);
    });

    it('should return portfolio templates for portfolio mode', () => {
      const templates = getTemplatesByMode('portfolio');
      expect(templates).toEqual(portfolioTemplates);
      expect(templates.every((t) => t.mode === 'portfolio')).toBe(true);
    });
  });

  describe('searchTemplates', () => {
    it('should find templates by name', () => {
      const firstTemplate = allTemplates[0];
      const searchTerm = firstTemplate.name.slice(0, 5).toLowerCase();
      const results = searchTemplates(searchTerm);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((t) => t.id === firstTemplate.id)).toBe(true);
    });

    it('should find templates by description', () => {
      const firstTemplate = allTemplates[0];
      const searchTerm = firstTemplate.description.split(' ')[0].toLowerCase();
      const results = searchTemplates(searchTerm);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find templates by tags', () => {
      // Find a template with tags
      const templateWithTags = allTemplates.find((t) => t.tags.length > 0);
      if (templateWithTags) {
        const tag = templateWithTags.tags[0];
        const results = searchTemplates(tag);
        expect(results.length).toBeGreaterThan(0);
        expect(results.some((t) => t.tags.includes(tag))).toBe(true);
      }
    });

    it('should return empty array for no matches', () => {
      const results = searchTemplates('xyznonexistenttermxyz');
      expect(results).toEqual([]);
    });

    it('should be case insensitive', () => {
      const firstTemplate = allTemplates[0];
      const searchTermLower = firstTemplate.name.slice(0, 3).toLowerCase();
      const searchTermUpper = firstTemplate.name.slice(0, 3).toUpperCase();
      const resultsLower = searchTemplates(searchTermLower);
      const resultsUpper = searchTemplates(searchTermUpper);
      expect(resultsLower.length).toBe(resultsUpper.length);
    });
  });

  describe('Type guards', () => {
    it('isPortfolioTemplate should identify portfolio templates', () => {
      const portfolio = portfolioTemplates[0];
      const readme = readmeTemplates[0];
      expect(isPortfolioTemplate(portfolio)).toBe(true);
      expect(isPortfolioTemplate(readme)).toBe(false);
    });

    it('isReadmeTemplate should identify readme templates', () => {
      const portfolio = portfolioTemplates[0];
      const readme = readmeTemplates[0];
      expect(isReadmeTemplate(readme)).toBe(true);
      expect(isReadmeTemplate(portfolio)).toBe(false);
    });
  });
});
