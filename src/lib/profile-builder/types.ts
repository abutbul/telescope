export type TemplateCategory = 
  | 'minimalist' 
  | 'visual' 
  | 'interactive' 
  | 'professional' 
  | 'creative';

export type WidgetType =
  | 'github-stats'
  | 'language-chart'
  | 'commit-timeline'
  | 'contribution-graph'
  | 'streak-stats'
  | 'top-repos'
  | 'tech-stack-badges'
  | 'activity-feed'
  | 'social-links'
  | 'telescope-stats';

export type VariableType = 
  | 'text' 
  | 'textarea' 
  | 'url' 
  | 'email' 
  | 'select' 
  | 'multiselect'
  | 'image';

export interface TemplateVariable {
  key: string;
  label: string;
  type: VariableType;
  defaultValue?: string | string[];
  options?: string[];
  placeholder?: string;
  required: boolean;
  description?: string;
  pattern?: string; // Regex validation
}

export interface WidgetSlot {
  id: string;
  name: string;
  description: string;
  marker: string; // Comment marker in markdown
  allowedTypes: WidgetType[];
  defaultWidget?: WidgetType;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  enabled: boolean;
  options: Record<string, string | number | boolean | string[]>;
}

export interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  preview: string; // Screenshot URL or data URI
  author: string;
  stars: number;
  markdown: string;
  variables: TemplateVariable[];
  widgets: WidgetSlot[];
  images?: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
}

export interface TemplateCustomization {
  templateId: string;
  variables: Record<string, string | string[]>;
  widgets: WidgetConfig[];
  rawMarkdown?: string; // For advanced users
}

export interface TelescopeStats {
  accountAge: string;
  totalRepos: number;
  totalStars: number;
  totalCommits?: number;
  primaryLanguage: string;
  languageBreakdown: { name: string; percentage: number; color: string }[];
  topRepos: {
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
  }[];
}

export interface ProfileRepoStatus {
  exists: boolean;
  hasReadme: boolean;
  readmeContent?: string;
  readmeSha?: string;
  lastUpdated?: string;
}

export interface ReadmeBackup {
  sha: string;
  message: string;
  date: string;
  content?: string;
}
