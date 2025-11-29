// ==========================================
// Profile Builder Mode Types
// ==========================================

/**
 * The two main modes for the Profile Builder:
 * - 'readme': Edit and publish GitHub profile README (username/username repo)
 * - 'portfolio': Full portfolio website with multiple pages/sections
 */
export type ProfileBuilderMode = 'readme' | 'portfolio';

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
  | 'image'
  | 'array'
  | 'object';

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
  section?: string; // For grouping in portfolio mode
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

// ==========================================
// README Profile Template Types
// ==========================================

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
  mode: 'readme'; // Explicit mode marker
}

// ==========================================
// Portfolio Template Types (inspired by dev-portfolio)
// ==========================================

/**
 * Portfolio section types matching dev-portfolio structure
 */
export type PortfolioSectionType = 
  | 'home'
  | 'about'
  | 'skills'
  | 'education'
  | 'experience'
  | 'projects'
  | 'contact';

/**
 * Configuration for a portfolio section
 */
export interface PortfolioSection {
  id: string;
  type: PortfolioSectionType;
  title: string;
  enabled: boolean;
  order: number;
  data: Record<string, unknown>; // Section-specific data
}

/**
 * Home section data
 */
export interface HomeData {
  name: string;
  roles: string[];
  backgroundImage?: string;
}

/**
 * About section data  
 */
export interface AboutData {
  content: string; // Markdown supported
  imageSource?: string;
}

/**
 * Skills section data
 */
export interface SkillCategory {
  title: string;
  items: {
    icon: string;
    title: string;
  }[];
}

export interface SkillsData {
  intro: string;
  skills: SkillCategory[];
}

/**
 * Education section data
 */
export interface EducationItem {
  title: string; // Date range
  cardTitle: string; // Degree/Course
  cardSubtitle: string; // School/Institute
  cardDetailedText: string; // Extra info
  icon?: { src: string };
}

export interface EducationData {
  education: EducationItem[];
}

/**
 * Experience section data
 */
export interface ExperienceItem {
  title: string; // Role
  subtitle?: string; // Company
  workType?: string; // Full-time, Internship, etc.
  workDescription: string[]; // Bullet points, markdown supported
  dateText: string;
}

export interface ExperienceData {
  experiences: ExperienceItem[];
}

/**
 * Projects section data
 */
export interface ProjectItem {
  image?: string;
  title: string;
  bodyText: string; // Markdown supported
  links?: { text: string; href: string }[];
  tags?: string[];
}

export interface ProjectsData {
  projects: ProjectItem[];
}

/**
 * Social links data
 */
export interface SocialLink {
  network: string; // linkedin, github, twitter, email, etc.
  href: string;
}

export interface SocialData {
  social: SocialLink[];
}

/**
 * Contact section data
 */
export interface ContactData {
  email?: string;
  phone?: string;
  location?: string;
  social: SocialLink[];
}

/**
 * Navigation configuration
 */
export interface NavConfig {
  logo?: {
    source: string;
    height: number;
    width: number;
  };
  sections: {
    title: string;
    href: string;
    type?: 'link'; // Opens in new tab if 'link'
  }[];
}

/**
 * Theme configuration for portfolio
 */
export interface PortfolioTheme {
  name: string;
  accentColor: string;
  background: string;
  color: string;
  cardBackground: string;
  cardBorderColor: string;
  mode: 'light' | 'dark';
}

/**
 * Portfolio template - for full portfolio websites
 */
export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  preview: string;
  author: string;
  stars: number;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
  mode: 'portfolio'; // Explicit mode marker
  
  // Portfolio-specific configuration
  defaultSections: PortfolioSection[];
  defaultTheme: PortfolioTheme;
  defaultNav: NavConfig;
  variables: TemplateVariable[];
  features: string[]; // e.g., ['dark-mode', 'animations', 'responsive']
}

/**
 * Union type for both template types
 */
export type AnyTemplate = ProfileTemplate | PortfolioTemplate;

/**
 * Type guard to check if template is a portfolio template
 */
export function isPortfolioTemplate(template: AnyTemplate): template is PortfolioTemplate {
  return template.mode === 'portfolio';
}

/**
 * Type guard to check if template is a README template
 */
export function isReadmeTemplate(template: AnyTemplate): template is ProfileTemplate {
  return template.mode === 'readme';
}

// ==========================================
// Customization Types
// ==========================================

export interface TemplateCustomization {
  templateId: string;
  variables: Record<string, string | string[]>;
  widgets: WidgetConfig[];
  rawMarkdown?: string; // For advanced users (README mode)
}

/**
 * Portfolio customization - stores all section data
 */
export interface PortfolioCustomization {
  templateId: string;
  sections: PortfolioSection[];
  theme: PortfolioTheme;
  nav: NavConfig;
  social: SocialData;
  repoName?: string; // Custom repo name for GitHub Pages
}

// ==========================================
// Repository Status Types
// ==========================================

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

/**
 * Portfolio repo status - for GitHub Pages deployment
 */
export interface PortfolioRepoStatus {
  exists: boolean;
  repoName: string;
  hasGitHubPages: boolean;
  pagesUrl?: string;
  lastDeployed?: string;
  defaultBranch?: string;
}

export interface ReadmeBackup {
  sha: string;
  message: string;
  date: string;
  content?: string;
}
