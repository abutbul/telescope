/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemplateEngine } from '../../src/lib/profile-builder/template-engine';

// Mock WidgetGenerator
const mockWidgetGenerator = {
  generate: vi.fn(),
};

vi.mock('../../src/lib/profile-builder/widget-generator', () => ({
  WidgetGenerator: vi.fn().mockImplementation(() => mockWidgetGenerator),
}));


describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    mockWidgetGenerator.generate.mockReturnValue('Widget content');
    engine = new TemplateEngine('testuser');
  });

  it('should render template with variables', () => {
    const template = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'minimal' as any,
      preview: '',
      author: 'test',
      stars: 0,
      markdown: '# Hello {{name}}\n\nWelcome {{username}}!',
      variables: [],
      widgets: [],
      tags: [],
      difficulty: 'beginner' as any,
      lastUpdated: '',
    };

    const customization = {
      templateId: 'test',
      variables: {
        name: 'John',
        username: 'john123',
      },
      widgets: [],
    };

    const result = engine.render(template, customization);

    expect(result).toBe('# Hello John\n\nWelcome john123!\n');
  });

  it('should use raw markdown when provided', () => {
    const template = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'minimal' as any,
      preview: '',
      author: 'test',
      stars: 0,
      markdown: '# Original',
      variables: [],
      widgets: [],
      tags: [],
      difficulty: 'beginner' as any,
      lastUpdated: '',
    };

    const customization = {
      templateId: 'test',
      variables: {},
      widgets: [],
      rawMarkdown: '# Custom content',
    };

    const result = engine.render(template, customization);

    expect(result).toBe('# Custom content\n');
  });

  it('should inject widgets', () => {
    mockWidgetGenerator.generate.mockReturnValue('Widget content');

    const template = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'minimal' as any,
      preview: '',
      author: 'test',
      stars: 0,
      markdown: '# Title\n<!-- WIDGET:github-stats -->\nEnd',
      variables: [],
      widgets: [],
      tags: [],
      difficulty: 'beginner' as any,
      lastUpdated: '',
    };

    const customization = {
      templateId: 'test',
      variables: {},
      widgets: [
        {
          id: 'stats',
          type: 'github-stats' as any,
          enabled: true,
          options: {},
        },
      ],
    };

    const result = engine.render(template, customization);

    expect(result).toContain('Widget content');
    expect(mockWidgetGenerator.generate).toHaveBeenCalledWith(customization.widgets[0]);
  });

  it('should remove disabled widget markers', () => {
    const template = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'minimal' as any,
      preview: '',
      author: 'test',
      stars: 0,
      markdown: '# Title\n<!-- WIDGET:github-stats -->\nEnd',
      variables: [],
      widgets: [],
      tags: [],
      difficulty: 'beginner' as any,
      lastUpdated: '',
    };

    const customization = {
      templateId: 'test',
      variables: {},
      widgets: [
        {
          id: 'stats',
          type: 'github-stats' as any,
          enabled: false,
          options: {},
        },
      ],
    };

    const result = engine.render(template, customization);

    expect(result).toBe('# Title\n\nEnd\n');
  });

  it('should add metadata', () => {
    const template = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'minimal' as any,
      preview: '',
      author: 'test',
      stars: 0,
      markdown: 'Last updated: {{lastUpdated}}',
      variables: [],
      widgets: [],
      tags: [],
      difficulty: 'beginner' as any,
      lastUpdated: '',
    };

    const customization = {
      templateId: 'test',
      variables: {},
      widgets: [],
    };

    const result = engine.render(template, customization);

    expect(result).toContain('Last updated: ');
    expect(result).toMatch(/Last updated: \d{4}-\d{2}-\d{2}/);
  });

  it('should extract variables from markdown', () => {
    const markdown = 'Hello {{name}}, welcome {{username}}! {{name}} again.';
    const variables = TemplateEngine.extractVariables(markdown);

    expect(variables).toEqual(['name', 'username']);
  });

  it('should preview template', () => {
    const template = {
      id: 'test',
      name: 'Test',
      description: 'Test template',
      category: 'minimal' as any,
      preview: '',
      author: 'test',
      stars: 0,
      markdown: '# {{name}}',
      variables: [
        {
          key: 'name',
          label: 'Name',
          type: 'text' as any,
          required: true,
          placeholder: 'Your name',
        },
      ],
      widgets: [
        {
          id: 'header',
          name: 'Header',
          description: 'Header widget',
          marker: '<!-- WIDGET:text -->',
          allowedTypes: ['text' as any],
          defaultWidget: 'text' as any,
        },
      ],
      tags: [],
      difficulty: 'beginner' as any,
      lastUpdated: '',
    };

    const result = TemplateEngine.preview(template);

    expect(result).toContain('# Your name');
  });
});