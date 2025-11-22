import { ProfileTemplate, TemplateCustomization, TelescopeStats, WidgetConfig } from './types';
import { WidgetGenerator } from './widget-generator';

export class TemplateEngine {
  constructor(
    private username: string,
    private telescopeStats?: TelescopeStats,
  ) {}

  /**
   * Render a template with user customization and widgets
   */
  render(template: ProfileTemplate, customization: TemplateCustomization): string {
    let markdown = template.markdown;

    // Use custom raw markdown if provided (advanced mode)
    if (customization.rawMarkdown) {
      markdown = customization.rawMarkdown;
    }

    // Replace template variables
    markdown = this.replaceVariables(markdown, customization.variables);

    // Inject widgets
    markdown = this.injectWidgets(markdown, customization.widgets);

    // Add auto-generated metadata
    markdown = this.addMetadata(markdown);

    return markdown.trim() + '\n';
  }

  /**
   * Replace {{variable}} placeholders with actual values
   */
  private replaceVariables(
    markdown: string,
    variables: Record<string, string | string[]>,
  ): string {
    return markdown.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      
      if (value === undefined || value === null) {
        return match; // Keep placeholder if no value
      }

      if (Array.isArray(value)) {
        return value.join(', ');
      }

      return String(value);
    });
  }

  /**
   * Replace widget markers with generated widget content
   */
  private injectWidgets(markdown: string, widgets: WidgetConfig[]): string {
    const generator = new WidgetGenerator(this.username, this.telescopeStats);

    widgets.forEach((widget) => {
      const marker = `<!-- WIDGET:${widget.type} -->`;

      if (!widget.enabled) {
        // Remove marker if widget is disabled
        markdown = markdown.replace(marker, '');
        return;
      }

      const widgetContent = generator.generate(widget);
      
      // Replace the comment marker with actual content
      markdown = markdown.replace(marker, widgetContent);
    });

    // Clean up any remaining widget markers
    markdown = markdown.replace(/<!-- WIDGET:[^>]+ -->/g, '');

    return markdown;
  }

  /**
   * Add generated metadata (like last updated timestamp)
   */
  private addMetadata(markdown: string): string {
    const lastUpdated = new Date().toISOString().split('T')[0];
    
    // Replace {{lastUpdated}} if present
    markdown = markdown.replace(/\{\{lastUpdated\}\}/g, lastUpdated);

    return markdown;
  }

  /**
   * Extract variables from markdown template
   */
  static extractVariables(markdown: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Preview template with placeholder data
   */
  static preview(template: ProfileTemplate): string {
    const placeholderCustomization: TemplateCustomization = {
      templateId: template.id,
      variables: {},
      widgets: template.widgets.map((slot) => ({
        id: slot.id,
        type: slot.defaultWidget || slot.allowedTypes[0],
        enabled: true,
        options: {},
      })),
    };

    // Fill with placeholder values
    template.variables.forEach((variable) => {
      placeholderCustomization.variables[variable.key] = 
        variable.placeholder || variable.defaultValue || `{{${variable.key}}}`;
    });

    const engine = new TemplateEngine('username');
    return engine.render(template, placeholderCustomization);
  }
}
