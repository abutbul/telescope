# GitHub Profile Homepage Builder - Design Document

## Overview
Extend Telescope to offer a "GitHub Profile Builder" feature that allows users to create and customize their GitHub profile README (username/username repository) with eye-catching templates inspired by popular developer portfolios. Users can customize templates, inject dynamic data from Telescope analytics, edit code in-browser, and commit directly through OAuth.

## Inspiration
Based on research of popular GitHub profile templates:
- **rajaprerak/rajaprerak**: Clean, badge-based profile with tech stack visualization, GitHub stats cards, and animated GIFs
- **mayankagarwal09/dev-portfolio**: React-based portfolio with JSON-driven configuration, modular sections, dark mode support

## Core Features

### 1. Template Gallery
A curated collection of pre-built GitHub profile README templates:

#### Template Categories
- **Minimalist**: Clean text-based profiles with badges and links
- **Visual**: Rich profiles with images, GIFs, stats visualizations
- **Interactive**: Profiles with GitHub stats cards, contribution graphs, activity widgets
- **Professional**: Resume-style layouts with work experience and education
- **Creative**: Animated profiles with terminal themes, matrix effects, custom graphics

#### Initial Template Collection
1. **"Developer Card"** - Badge-heavy profile showing tech stack
2. **"Stats Dashboard"** - GitHub stats, streaks, language charts
3. **"Terminal Theme"** - Hacker-style ASCII art profile
4. **"Portfolio Showcase"** - Project cards with descriptions
5. **"Professional Resume"** - Formal layout with experience timeline
6. **"Animated Welcome"** - Typewriter effects, dynamic greetings
7. **"Widget Gallery"** - Collection of embeddable widgets

### 2. Template Structure
Each template consists of:
```typescript
interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  preview: string; // Screenshot URL
  author: string;
  stars: number; // Popularity metric
  
  // Template content
  markdown: string; // Base Markdown template
  variables: TemplateVariable[]; // Customizable fields
  widgets: WidgetSlot[]; // Where Telescope data can be injected
  
  // Assets
  images?: string[]; // Required images
  badges?: BadgeConfig[]; // Shield.io badge configurations
  
  // Metadata
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
}

interface TemplateVariable {
  key: string; // e.g., "name", "tagline", "location"
  label: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'select' | 'multiselect';
  defaultValue?: string;
  options?: string[]; // For select/multiselect
  placeholder?: string;
  required: boolean;
  description?: string;
}

interface WidgetSlot {
  id: string;
  name: string;
  description: string;
  position: number; // Line number or marker in markdown
  widgetType: WidgetType[];
  defaultWidget?: string;
}

type WidgetType = 
  | 'github-stats' 
  | 'language-chart' 
  | 'commit-timeline'
  | 'top-repos'
  | 'tech-stack-badges'
  | 'contribution-graph'
  | 'activity-feed'
  | 'social-links';
```

### 3. In-Browser Code Editor
Integrate a powerful code editor for developers who want full control:

#### Editor Options
- **Monaco Editor** (VS Code's editor engine) - Full-featured, syntax highlighting, IntelliSense
- **CodeMirror 6** - Lightweight alternative with good Markdown support

#### Editor Features
- Syntax highlighting for Markdown
- Live preview pane (side-by-side or bottom)
- HTML preview rendering
- Split view: Template form + Raw editor
- Markdown toolbar (bold, italic, links, images, code blocks)
- Find/Replace functionality
- Undo/Redo with history
- Auto-save to localStorage
- Export to file
- Import from file/URL

#### Editor Modes
1. **Beginner Mode**: Form-based customization only
2. **Intermediate Mode**: Form + limited markdown editing
3. **Advanced Mode**: Full raw markdown editor with preview

### 4. GitHub Repository Management

#### Profile Repo Creation
```typescript
interface ProfileRepoManager {
  // Check if username/username repo exists
  checkProfileRepoExists(): Promise<boolean>;
  
  // Create username/username repository
  createProfileRepo(config: {
    description: string;
    private: boolean;
  }): Promise<Repository>;
  
  // Get current README.md content
  getCurrentReadme(): Promise<{ content: string; sha: string } | null>;
  
  // Update README.md with new content
  updateReadme(content: string, message: string, sha?: string): Promise<void>;
  
  // Backup current README before overwriting
  backupReadme(): Promise<void>;
  
  // Restore from backup
  restoreReadme(backupSha: string): Promise<void>;
  
  // List all backups (commits to README.md)
  listBackups(): Promise<Commit[]>;
}
```

#### Commit Flow
1. User customizes template
2. Preview generated markdown
3. Click "Deploy to GitHub"
4. If profile repo doesn't exist: Create it automatically
5. If README.md exists: Show backup/overwrite confirmation
6. Commit with message: "Updated profile via Telescope"
7. Show success message with link to live profile

### 5. Widget System
Inject dynamic data from Telescope's analytics into profile README:

#### Available Widgets

##### 1. GitHub Stats Card
```markdown
![GitHub Stats](https://github-readme-stats.vercel.app/api?username={username}&show_icons=true&theme=dark)
```

##### 2. Language Chart
```markdown
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username={username}&layout=compact&theme=dark)
```

##### 3. Contribution Graph
```markdown
![GitHub Streak](https://github-readme-streak-stats.herokuapp.com/?user={username}&theme=dark)
```

##### 4. Tech Stack Badges (from Telescope data)
Generate shields.io badges from user's most-used languages:
```markdown
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
```

##### 5. Account Stats (from Telescope analytics)
Custom widget showing:
- Account age
- Total commits (calculated by Telescope)
- Total stars received
- Total repositories
- Primary language

##### 6. Top Repositories
Automatically populated from Telescope's cached repo data:
```markdown
### 🔥 Featured Projects
- **[repo-name](link)** - Description (⭐ 123)
- **[another-repo](link)** - Description (⭐ 89)
```

##### 7. Activity Timeline
Recent commit activity visualization (text-based or image)

##### 8. Social Links
Auto-populated from user's GitHub profile:
```markdown
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](url)
[![Twitter](https://img.shields.io/badge/-Twitter-1DA1F2?style=flat&logo=twitter&logoColor=white)](url)
```

#### Widget Configuration
```typescript
interface WidgetConfig {
  enabled: boolean;
  type: WidgetType;
  options: Record<string, any>; // Widget-specific options
  position?: 'header' | 'body' | 'footer' | number; // Placement
}

// Example: Tech stack widget
interface TechStackWidgetOptions {
  style: 'flat' | 'flat-square' | 'for-the-badge';
  theme: 'light' | 'dark';
  languages: string[]; // Auto-detected or manual
  maxBadges: number;
  sortBy: 'usage' | 'alphabetical';
}
```

### 6. Template Customization UI

#### Customization Modes

##### A. Form-Based Customization
For beginners - structured form with fields for each variable:
```typescript
interface CustomizationForm {
  sections: FormSection[];
}

interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  variable: TemplateVariable;
  value: string | string[];
  validation?: ValidationRule[];
}
```

Example form sections:
- **Personal Info**: Name, tagline, location, email
- **Tech Stack**: Programming languages, frameworks, tools
- **Links**: GitHub, LinkedIn, Twitter, website, blog
- **Content Sections**: About me, current work, learning goals
- **Widgets**: Select which widgets to include
- **Styling**: Theme, color scheme, badge style

##### B. Visual Customizer
Drag-and-drop interface for advanced users:
- Reorder sections by dragging
- Toggle section visibility
- Adjust widget sizes
- Change color schemes
- Upload custom images

##### C. Live Preview
Real-time markdown preview showing how profile will look:
- Renders markdown with GitHub styling
- Shows actual GitHub stats (using real APIs)
- Mobile/Desktop preview toggle
- Dark/Light mode toggle

### 7. Data Integration
Pull data from Telescope's existing analytics:

```typescript
interface TelescopeDataSource {
  // From Dashboard
  getUserStats(): Promise<{
    accountAge: string;
    totalRepos: number;
    totalStars: number;
    primaryLanguage: string;
    languageBreakdown: LanguageStats[];
  }>;
  
  // From Stars Page
  getTopStarredRepos(limit: number): Promise<Repository[]>;
  
  // Custom calculations
  getTotalCommits(): Promise<number>;
  getContributionStreak(): Promise<number>;
  getMostActiveRepos(): Promise<Repository[]>;
  
  // Generate content
  generateTechStackBadges(): Promise<string[]>;
  generateLanguageSection(): Promise<string>;
  generateStatsSection(): Promise<string>;
}
```

Auto-populate template fields:
- **Name**: From authenticated user profile
- **Bio**: From GitHub profile bio
- **Location**: From GitHub profile
- **Company**: From GitHub profile
- **Tech Stack**: Auto-detected from top languages
- **Stats**: Account age, repos, stars, commits

### 8. Template Marketplace

#### Community Templates
Allow users to share their custom profiles:
- Export template as JSON
- Share via URL or file
- Import community templates
- Rate and favorite templates
- Search and filter templates

#### Template Versioning
- Track template updates
- Notify users of new versions
- One-click template updates (preserving custom data)

## Technical Implementation

### File Structure
```
src/
├── pages/
│   └── ProfileBuilder.tsx          # Main profile builder page
├── components/
│   └── profile-builder/
│       ├── TemplateGallery.tsx      # Browse and select templates
│       ├── TemplateCard.tsx         # Template preview card
│       ├── TemplateCustomizer.tsx   # Main customization interface
│       ├── CustomizationForm.tsx    # Form-based editor
│       ├── MarkdownEditor.tsx       # Code editor component
│       ├── LivePreview.tsx          # Rendered markdown preview
│       ├── WidgetSelector.tsx       # Choose and configure widgets
│       ├── ProfileRepoSetup.tsx     # Create/manage profile repo
│       ├── DeployModal.tsx          # Commit confirmation dialog
│       └── BackupManager.tsx        # Manage README backups
├── lib/
│   └── profile-builder/
│       ├── templates/               # Template definitions
│       │   ├── index.ts
│       │   ├── developer-card.ts
│       │   ├── stats-dashboard.ts
│       │   ├── terminal-theme.ts
│       │   └── ...
│       ├── template-engine.ts       # Template processing logic
│       ├── widget-generator.ts      # Widget creation utilities
│       ├── markdown-utils.ts        # Markdown manipulation
│       └── profile-repo-manager.ts  # GitHub API for profile repo
└── stores/
    └── profile-builder-store.ts     # State management
```

### State Management (Zustand Store)
```typescript
interface ProfileBuilderStore {
  // Template selection
  selectedTemplate: ProfileTemplate | null;
  templates: ProfileTemplate[];
  
  // Customization state
  customization: {
    variables: Record<string, any>;
    widgets: WidgetConfig[];
    rawMarkdown: string;
  };
  
  // Editor state
  editorMode: 'form' | 'visual' | 'code';
  isDirty: boolean; // Has unsaved changes
  
  // Preview
  previewMarkdown: string;
  previewTheme: 'light' | 'dark';
  
  // GitHub integration
  profileRepo: Repository | null;
  currentReadme: { content: string; sha: string } | null;
  backups: Commit[];
  
  // Actions
  selectTemplate: (template: ProfileTemplate) => void;
  updateVariable: (key: string, value: any) => void;
  updateWidget: (widgetId: string, config: WidgetConfig) => void;
  updateRawMarkdown: (markdown: string) => void;
  generatePreview: () => void;
  
  // GitHub actions
  checkProfileRepo: () => Promise<void>;
  createProfileRepo: () => Promise<void>;
  deployToGitHub: (commitMessage: string) => Promise<void>;
  backupCurrent: () => Promise<void>;
  restoreBackup: (sha: string) => Promise<void>;
}
```

### Template Engine
```typescript
class TemplateEngine {
  /**
   * Process template with user data and widgets
   */
  render(
    template: ProfileTemplate,
    variables: Record<string, any>,
    widgets: WidgetConfig[],
    telescopeData: TelescopeDataSource
  ): string {
    let markdown = template.markdown;
    
    // Replace variables
    markdown = this.replaceVariables(markdown, variables);
    
    // Inject widgets
    markdown = this.injectWidgets(markdown, widgets, telescopeData);
    
    // Post-process
    markdown = this.formatMarkdown(markdown);
    
    return markdown;
  }
  
  private replaceVariables(
    markdown: string,
    variables: Record<string, any>
  ): string {
    return markdown.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] ?? match;
    });
  }
  
  private injectWidgets(
    markdown: string,
    widgets: WidgetConfig[],
    data: TelescopeDataSource
  ): string {
    widgets.forEach(widget => {
      const widgetMarkdown = this.generateWidget(widget, data);
      const placeholder = `<!-- WIDGET:${widget.type} -->`;
      markdown = markdown.replace(placeholder, widgetMarkdown);
    });
    
    return markdown;
  }
  
  private generateWidget(
    config: WidgetConfig,
    data: TelescopeDataSource
  ): string {
    // Generate widget markdown based on type
    // ...
  }
}
```

### GitHub Profile Repo API
```typescript
class ProfileRepoManager {
  constructor(private api: GitHubAPI) {}
  
  async checkProfileRepoExists(username: string): Promise<boolean> {
    try {
      await this.api.octokit.rest.repos.get({
        owner: username,
        repo: username,
      });
      return true;
    } catch (error) {
      if (error.status === 404) return false;
      throw error;
    }
  }
  
  async createProfileRepo(username: string): Promise<Repository> {
    const repo = await this.api.octokit.rest.repos.createForAuthenticatedUser({
      name: username,
      description: `Profile README for ${username}`,
      auto_init: true,
      private: false,
    });
    
    return repo.data;
  }
  
  async updateReadme(
    username: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<void> {
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    await this.api.octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: username,
      path: 'README.md',
      message,
      content: encodedContent,
      sha, // Required for updates
    });
  }
  
  async getCurrentReadme(username: string): Promise<{ content: string; sha: string } | null> {
    try {
      const response = await this.api.octokit.rest.repos.getContent({
        owner: username,
        repo: username,
        path: 'README.md',
      });
      
      if ('content' in response.data) {
        const content = decodeURIComponent(escape(atob(response.data.content)));
        return { content, sha: response.data.sha };
      }
      
      return null;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
}
```

## UI/UX Flow

### Main Flow
1. **Navigate to Profile Builder** (new nav item: "Profile Builder")
2. **Template Gallery Screen**
   - Grid of template cards with previews
   - Filter by category, difficulty, tags
   - Search bar
   - Sort by popularity, recent, alphabetical
   - Click template to select
3. **Customization Screen**
   - Left sidebar: Template selector + customization form
   - Center: Live preview
   - Right sidebar: Widget configuration
   - Top bar: Mode selector (Form/Visual/Code), Save, Deploy buttons
4. **Deploy Flow**
   - Click "Deploy to GitHub"
   - If no profile repo: "Create username/username repository?"
   - If README exists: "Backup current README before overwriting?"
   - Show commit message input
   - Progress indicator during commit
   - Success: Show link to live profile + celebration animation
5. **Manage Backups**
   - Access from settings/menu
   - List all README commits
   - Preview each version
   - One-click restore

## Dependencies

### New Packages
```json
{
  "@monaco-editor/react": "^4.6.0",  // VS Code editor
  "react-markdown": "^9.0.1",        // Markdown rendering
  "remark-gfm": "^4.0.0",            // GitHub Flavored Markdown
  "gray-matter": "^4.0.3",           // Parse frontmatter
  "prettier": "^3.1.1",              // Format markdown
  "marked": "^11.1.0",               // Alternative markdown parser
  "@codemirror/lang-markdown": "^6.2.4", // CodeMirror markdown support
  "react-split-pane": "^0.1.92",     // Split editor/preview
  "react-beautiful-dnd": "^13.1.1"   // Drag-and-drop sections
}
```

## Example Templates

### Template 1: "Developer Card"
```markdown
<div align="center">
  <img src="{{headerImage}}" alt="Header" width="100%"/>
</div>

<h1 align="center">Hi there, I'm {{name}} 👋</h1>
<h3 align="center">{{tagline}}</h3>

<p align="center">
  <a href="{{linkedin}}"><img src="https://img.shields.io/badge/-LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white"/></a>
  <a href="{{twitter}}"><img src="https://img.shields.io/badge/-Twitter-1DA1F2?style=flat&logo=twitter&logoColor=white"/></a>
  <a href="{{website}}"><img src="https://img.shields.io/badge/-Website-000000?style=flat&logo=google-chrome&logoColor=white"/></a>
</p>

---

## 🚀 About Me
{{aboutMe}}

## 🛠 Tech Stack
<!-- WIDGET:tech-stack-badges -->

## 📊 GitHub Stats
<!-- WIDGET:github-stats -->

## 🔥 Streak Stats
<!-- WIDGET:contribution-graph -->

## 📈 Top Languages
<!-- WIDGET:language-chart -->

---

<p align="center">
  <i>⚡ Let's connect and build something amazing together!</i>
</p>
```

### Template 2: "Stats Dashboard"
```markdown
# {{name}} - {{tagline}}

### 👨‍💻 About
{{aboutMe}}

### 📊 GitHub Analytics

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username={{username}}&show_icons=true&theme=dark&count_private=true" />
  <img src="https://github-readme-streak-stats.herokuapp.com/?user={{username}}&theme=dark" />
</p>

### 💻 Tech Stack
<!-- WIDGET:tech-stack-badges -->

### 📈 Activity Graph
<!-- WIDGET:activity-feed -->

---
💬 Feel free to reach out: {{email}}
```

## Testing Strategy

### Unit Tests
- Template engine rendering
- Variable substitution
- Widget generation
- Markdown utilities

### Integration Tests
- GitHub API integration (create repo, update file)
- Template selection and customization flow
- Backup and restore functionality

### E2E Tests
- Complete flow: Select template → Customize → Deploy
- Editor functionality (form, visual, code modes)
- Preview rendering

## Future Enhancements

### Phase 2
- **Template Editor**: Create custom templates from scratch
- **Animation Support**: Add typing animations, particles, custom effects
- **Image Upload**: Upload custom images to GitHub repo
- **Profile Analytics**: Track profile views, engagement
- **A/B Testing**: Test different profile versions
- **Schedule Updates**: Automatically update stats daily/weekly

### Phase 3
- **AI-Powered**: Generate profile copy with AI
- **Smart Suggestions**: Recommend templates based on user's tech stack
- **Profile Score**: Rate profile completeness and appeal
- **Collaboration**: Share templates with teams
- **Version Control**: Git-like branching for profiles

## Success Metrics
- Number of profiles deployed
- Template adoption rates
- User retention (users who update profiles regularly)
- Time from start to deploy
- User satisfaction scores

## Accessibility
- Keyboard navigation for all features
- Screen reader support
- High contrast mode
- Proper ARIA labels
- Focus management in modals

## Security Considerations
- Sanitize user input to prevent XSS
- Validate markdown output
- Rate limit GitHub API calls
- Secure token storage (already implemented)
- Backup user data before overwriting

---

## Summary
The GitHub Profile Builder transforms Telescope from a profile analytics tool into a complete profile management platform. By combining powerful templates, in-browser editing, and seamless GitHub integration, we make it effortless for developers to create stunning profile READMEs without leaving the browser or writing code manually (unless they want to).
