import { create } from 'zustand';
import {
  ProfileTemplate,
  PortfolioTemplate,
  AnyTemplate,
  TemplateCustomization,
  PortfolioCustomization,
  WidgetConfig,
  ProfileRepoStatus,
  PortfolioRepoStatus,
  ReadmeBackup,
  ProfileBuilderMode,
  PortfolioSection,
  PortfolioTheme,
  NavConfig,
  SocialData,
  isPortfolioTemplate,
  isReadmeTemplate,
} from '../lib/profile-builder/types';
import { ProfileRepoManager } from '../lib/profile-builder/profile-repo-manager';
import { TemplateEngine } from '../lib/profile-builder/template-engine';
import { allTemplates, readmeTemplates, portfolioTemplates } from '../lib/profile-builder/templates';
import { useAuthStore } from './auth-store';
import { useUserStore } from './user-store';
import { GitHubAPI } from '../lib/github/api';

interface ProfileBuilderState {
  // Mode selection
  builderMode: ProfileBuilderMode;
  
  // Templates
  templates: AnyTemplate[];
  selectedTemplate: AnyTemplate | null;
  filterCategory: string | null;
  searchQuery: string;

  // README Customization
  customization: TemplateCustomization | null;
  
  // Portfolio Customization
  portfolioCustomization: PortfolioCustomization | null;
  
  isDirty: boolean;

  // Preview
  previewMarkdown: string;
  editorMode: 'form' | 'code' | 'split';

  // GitHub integration - README
  profileRepoStatus: ProfileRepoStatus | null;
  backups: ReadmeBackup[];
  
  // GitHub integration - Portfolio
  portfolioRepoStatus: PortfolioRepoStatus | null;
  
  isDeploying: boolean;
  deployError: string | null;

  // Loading states
  isLoadingStatus: boolean;
  isLoadingBackups: boolean;

  // Actions
  setBuilderMode: (mode: ProfileBuilderMode) => void;
  selectTemplate: (template: AnyTemplate) => void;
  loadCurrentProfile: () => Promise<void>;
  setFilterCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;

  // README Customization actions
  updateVariable: (key: string, value: string | string[]) => void;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  toggleWidget: (widgetId: string) => void;
  setRawMarkdown: (markdown: string) => void;
  setEditorMode: (mode: 'form' | 'code' | 'split') => void;

  // Portfolio Customization actions
  updatePortfolioSection: (sectionId: string, data: Partial<PortfolioSection>) => void;
  togglePortfolioSection: (sectionId: string) => void;
  reorderPortfolioSections: (sections: PortfolioSection[]) => void;
  updatePortfolioTheme: (theme: Partial<PortfolioTheme>) => void;
  updatePortfolioNav: (nav: Partial<NavConfig>) => void;
  updatePortfolioSocial: (social: SocialData) => void;

  // Preview
  generatePreview: () => void;

  // GitHub actions
  checkProfileRepoStatus: () => Promise<void>;
  createProfileRepo: (description?: string) => Promise<void>;
  deployToGitHub: (commitMessage?: string) => Promise<void>;
  loadBackups: () => Promise<void>;
  restoreFromBackup: (backupSha: string) => Promise<void>;
  
  // Portfolio GitHub actions
  checkPortfolioRepoStatus: () => Promise<void>;
  deployPortfolioToGitHub: () => Promise<void>;

  // Reset
  reset: () => void;

  // Helpers
  getFilteredTemplates: () => AnyTemplate[];
}

export const useProfileBuilderStore = create<ProfileBuilderState>((set, get) => ({
  // Initial state
  builderMode: 'readme',
  templates: allTemplates,
  selectedTemplate: null,
  filterCategory: null,
  searchQuery: '',

  customization: null,
  portfolioCustomization: null,
  isDirty: false,

  previewMarkdown: '',
  editorMode: 'form',

  profileRepoStatus: null,
  portfolioRepoStatus: null,
  backups: [],
  isDeploying: false,
  deployError: null,

  isLoadingStatus: false,
  isLoadingBackups: false,

  // Mode selection
  setBuilderMode: (mode) => {
    set({ 
      builderMode: mode,
      selectedTemplate: null,
      customization: null,
      portfolioCustomization: null,
      isDirty: false,
      previewMarkdown: '',
    });
  },

  // Get filtered templates based on mode
  getFilteredTemplates: () => {
    const { builderMode, filterCategory, searchQuery } = get();
    
    // Filter by mode first
    let filtered = builderMode === 'readme' 
      ? readmeTemplates as AnyTemplate[]
      : portfolioTemplates as AnyTemplate[];
    
    // Then by category
    if (filterCategory) {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }
    
    // Then by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }
    
    return filtered;
  },

  // Template selection
  selectTemplate: (template) => {
    const user = useUserStore.getState().user;

    if (!user) return;

    if (isPortfolioTemplate(template)) {
      // Initialize portfolio customization
      const portfolioCustomization: PortfolioCustomization = {
        templateId: template.id,
        sections: template.defaultSections.map((section) => ({
          ...section,
          data: { ...section.data },
        })),
        theme: { ...template.defaultTheme },
        nav: {
          ...template.defaultNav,
          sections: [...template.defaultNav.sections],
        },
        social: {
          social: [
            { network: 'github', href: `https://github.com/${user.login}` },
            { network: 'linkedin', href: '' },
            { network: 'twitter', href: '' },
          ],
        },
        repoName: `${user.login}.github.io`,
      };

      // Auto-fill user data into sections
      const homeSection = portfolioCustomization.sections.find((s) => s.type === 'home');
      if (homeSection) {
        homeSection.data = {
          ...homeSection.data,
          name: user.name || user.login,
        };
      }

      const aboutSection = portfolioCustomization.sections.find((s) => s.type === 'about');
      if (aboutSection && user.bio) {
        aboutSection.data = {
          ...aboutSection.data,
          content: user.bio,
        };
      }

      set({
        selectedTemplate: template,
        portfolioCustomization,
        customization: null,
        isDirty: false,
        builderMode: 'portfolio',
      });
    } else {
      // Initialize README customization (existing logic)
      const customization: TemplateCustomization = {
        templateId: template.id,
        variables: {
          username: user.login,
          name: user.name || user.login,
        },
        widgets: template.widgets.map((slot) => ({
          id: slot.id,
          type: slot.defaultWidget || slot.allowedTypes[0],
          enabled: true,
          options: {},
        })),
      };

      // Auto-fill from user profile
      if (user.bio) customization.variables.aboutMe = user.bio;
      if (user.location) customization.variables.location = user.location;
      if (user.email) customization.variables.email = user.email;
      if (user.blog) {
        customization.variables.website = 'Website';
        customization.variables.websiteUrl = user.blog;
      }

      set({
        selectedTemplate: template,
        customization,
        portfolioCustomization: null,
        isDirty: false,
        builderMode: 'readme',
      });

      // Generate initial preview
      get().generatePreview();
    }
  },

  loadCurrentProfile: async () => {
    const user = useUserStore.getState().user;
    const { profileRepoStatus } = get();

    if (!user) return;

    // Ensure we have the latest status
    if (!profileRepoStatus) {
      await get().checkProfileRepoStatus();
    }

    const currentStatus = get().profileRepoStatus;

    if (!currentStatus?.readmeContent) {
      throw new Error('No profile README found to load');
    }

    // Create a dummy template for the current profile
    const currentProfileTemplate: ProfileTemplate = {
      id: 'current-profile',
      name: 'Current Profile',
      description: 'Your existing GitHub profile README',
      category: 'professional',
      preview: '',
      author: user.login,
      stars: 0,
      markdown: currentStatus.readmeContent,
      variables: [],
      widgets: [],
      tags: ['current'],
      difficulty: 'intermediate',
      lastUpdated: new Date().toISOString(),
      mode: 'readme',
    };

    const customization: TemplateCustomization = {
      templateId: 'current-profile',
      variables: {},
      widgets: [],
      rawMarkdown: currentStatus.readmeContent,
    };

    set({
      selectedTemplate: currentProfileTemplate,
      customization,
      portfolioCustomization: null,
      isDirty: false,
      previewMarkdown: currentStatus.readmeContent,
      editorMode: 'code', // Force code mode for existing profiles
      builderMode: 'readme',
    });
  },

  setFilterCategory: (category) => set({ filterCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // README Customization
  updateVariable: (key, value) => {
    const { customization } = get();
    if (!customization) return;

    set({
      customization: {
        ...customization,
        variables: {
          ...customization.variables,
          [key]: value,
        },
      },
      isDirty: true,
    });

    get().generatePreview();
  },

  updateWidget: (widgetId, updates) => {
    const { customization } = get();
    if (!customization) return;

    set({
      customization: {
        ...customization,
        widgets: customization.widgets.map((w) =>
          w.id === widgetId ? { ...w, ...updates } : w,
        ),
      },
      isDirty: true,
    });

    get().generatePreview();
  },

  toggleWidget: (widgetId) => {
    const { customization } = get();
    if (!customization) return;

    set({
      customization: {
        ...customization,
        widgets: customization.widgets.map((w) =>
          w.id === widgetId ? { ...w, enabled: !w.enabled } : w,
        ),
      },
      isDirty: true,
    });

    get().generatePreview();
  },

  setRawMarkdown: (markdown) => {
    const { customization } = get();
    if (!customization) return;

    set({
      customization: {
        ...customization,
        rawMarkdown: markdown,
      },
      isDirty: true,
      previewMarkdown: markdown,
    });
  },

  setEditorMode: (mode) => set({ editorMode: mode }),

  // Portfolio Customization actions
  updatePortfolioSection: (sectionId, data) => {
    const { portfolioCustomization } = get();
    if (!portfolioCustomization) return;

    set({
      portfolioCustomization: {
        ...portfolioCustomization,
        sections: portfolioCustomization.sections.map((s) =>
          s.id === sectionId ? { ...s, ...data, data: { ...s.data, ...data.data } } : s,
        ),
      },
      isDirty: true,
    });
  },

  togglePortfolioSection: (sectionId) => {
    const { portfolioCustomization } = get();
    if (!portfolioCustomization) return;

    set({
      portfolioCustomization: {
        ...portfolioCustomization,
        sections: portfolioCustomization.sections.map((s) =>
          s.id === sectionId ? { ...s, enabled: !s.enabled } : s,
        ),
      },
      isDirty: true,
    });
  },

  reorderPortfolioSections: (sections) => {
    const { portfolioCustomization } = get();
    if (!portfolioCustomization) return;

    set({
      portfolioCustomization: {
        ...portfolioCustomization,
        sections: sections.map((s, index) => ({ ...s, order: index })),
      },
      isDirty: true,
    });
  },

  updatePortfolioTheme: (theme) => {
    const { portfolioCustomization } = get();
    if (!portfolioCustomization) return;

    set({
      portfolioCustomization: {
        ...portfolioCustomization,
        theme: { ...portfolioCustomization.theme, ...theme },
      },
      isDirty: true,
    });
  },

  updatePortfolioNav: (nav) => {
    const { portfolioCustomization } = get();
    if (!portfolioCustomization) return;

    set({
      portfolioCustomization: {
        ...portfolioCustomization,
        nav: { ...portfolioCustomization.nav, ...nav },
      },
      isDirty: true,
    });
  },

  updatePortfolioSocial: (social) => {
    const { portfolioCustomization } = get();
    if (!portfolioCustomization) return;

    set({
      portfolioCustomization: {
        ...portfolioCustomization,
        social,
      },
      isDirty: true,
    });
  },

  // Preview generation
  generatePreview: () => {
    const { selectedTemplate, customization, builderMode } = get();
    
    // Only generate preview for README mode
    if (builderMode !== 'readme' || !selectedTemplate || !customization) return;
    if (!isReadmeTemplate(selectedTemplate)) return;

    const user = useUserStore.getState().user;
    const engine = new TemplateEngine(user?.login || 'username');
    const markdown = engine.render(selectedTemplate, customization);

    set({ previewMarkdown: markdown });
  },

  // GitHub operations
  checkProfileRepoStatus: async () => {
    const user = useUserStore.getState().user;
    const token = useAuthStore.getState().token;

    if (!user || !token) return;

    set({ isLoadingStatus: true });

    try {
      const api = new GitHubAPI(token);
      const manager = new ProfileRepoManager(api);
      const status = await manager.checkProfileRepo(user.login);
      set({ profileRepoStatus: status });
    } catch (error) {
      console.error('Failed to check profile repo status:', error);
    } finally {
      set({ isLoadingStatus: false });
    }
  },

  createProfileRepo: async (description) => {
    const user = useUserStore.getState().user;
    const token = useAuthStore.getState().token;

    if (!user || !token) return;

    set({ isDeploying: true, deployError: null });

    try {
      const api = new GitHubAPI(token);
      const manager = new ProfileRepoManager(api);
      await manager.createProfileRepo(user.login, description);
      await get().checkProfileRepoStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create profile repository';
      set({ deployError: message });
      throw error;
    } finally {
      set({ isDeploying: false });
    }
  },

  deployToGitHub: async (commitMessage = '✨ Updated profile via Telescope') => {
    const { previewMarkdown, profileRepoStatus } = get();
    const user = useUserStore.getState().user;
    const token = useAuthStore.getState().token;

    if (!user || !token) return;

    set({ isDeploying: true, deployError: null });

    try {
      const api = new GitHubAPI(token);
      const manager = new ProfileRepoManager(api);

      // Create repo if it doesn't exist
      if (!profileRepoStatus?.exists) {
        await get().createProfileRepo();
      }

      // Update README
      await manager.updateReadme(
        user.login,
        previewMarkdown,
        commitMessage,
        profileRepoStatus?.readmeSha,
      );

      set({ isDirty: false });
      await get().checkProfileRepoStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deploy to GitHub';
      set({ deployError: message });
      throw error;
    } finally {
      set({ isDeploying: false });
    }
  },

  loadBackups: async () => {
    const user = useUserStore.getState().user;
    const token = useAuthStore.getState().token;

    if (!user || !token) return;

    set({ isLoadingBackups: true });

    try {
      const api = new GitHubAPI(token);
      const manager = new ProfileRepoManager(api);
      const backups = await manager.listReadmeHistory(user.login);
      set({ backups });
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      set({ isLoadingBackups: false });
    }
  },

  restoreFromBackup: async (backupSha) => {
    const { profileRepoStatus } = get();
    const user = useUserStore.getState().user;
    const token = useAuthStore.getState().token;

    if (!user || !token || !profileRepoStatus?.readmeSha) return;

    set({ isDeploying: true, deployError: null });

    try {
      const api = new GitHubAPI(token);
      const manager = new ProfileRepoManager(api);
      await manager.restoreReadme(user.login, backupSha, profileRepoStatus.readmeSha);
      await get().checkProfileRepoStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore backup';
      set({ deployError: message });
      throw error;
    } finally {
      set({ isDeploying: false });
    }
  },

  // Portfolio GitHub actions
  checkPortfolioRepoStatus: async () => {
    const user = useUserStore.getState().user;
    const token = useAuthStore.getState().token;
    const { portfolioCustomization } = get();

    if (!user || !token) return;

    const repoName = portfolioCustomization?.repoName || `${user.login}.github.io`;

    set({ isLoadingStatus: true });

    try {
      const api = new GitHubAPI(token);
      
      // Check if repo exists
      let exists = false;
      let hasGitHubPages = false;
      let pagesUrl: string | undefined;
      let defaultBranch = 'main';
      
      try {
        const repo = await api.octokit.rest.repos.get({
          owner: user.login,
          repo: repoName,
        });
        exists = true;
        defaultBranch = repo.data.default_branch;
        
        // Check if GitHub Pages is enabled
        try {
          const pages = await api.octokit.rest.repos.getPages({
            owner: user.login,
            repo: repoName,
          });
          hasGitHubPages = true;
          pagesUrl = pages.data.html_url;
        } catch {
          // Pages not enabled
        }
      } catch {
        // Repo doesn't exist
      }

      set({
        portfolioRepoStatus: {
          exists,
          repoName,
          hasGitHubPages,
          pagesUrl,
          defaultBranch,
        },
      });
    } catch (error) {
      console.error('Failed to check portfolio repo status:', error);
    } finally {
      set({ isLoadingStatus: false });
    }
  },

  deployPortfolioToGitHub: async () => {
    const { portfolioCustomization, selectedTemplate } = get();
    const user = useUserStore.getState().user;
    const token = useAuthStore.getState().token;

    if (!user || !token || !portfolioCustomization || !selectedTemplate) return;
    if (!isPortfolioTemplate(selectedTemplate)) return;

    const repoName = portfolioCustomization.repoName || `${user.login}.github.io`;

    set({ isDeploying: true, deployError: null });

    try {
      const api = new GitHubAPI(token);

      // Check if repo exists
      let repoExists = false;
      try {
        await api.octokit.rest.repos.get({
          owner: user.login,
          repo: repoName,
        });
        repoExists = true;
      } catch {
        // Repo doesn't exist, we'll create it
      }

      // Create repo if it doesn't exist
      if (!repoExists) {
        await api.octokit.rest.repos.createForAuthenticatedUser({
          name: repoName,
          description: `Portfolio website for ${user.name || user.login}`,
          homepage: `https://${user.login}.github.io`,
          auto_init: true,
          private: false,
        });
      }

      // Generate portfolio configuration files
      const portfolioConfig = generatePortfolioConfig(portfolioCustomization, selectedTemplate, user);

      // Create/update files in the repo
      for (const file of portfolioConfig.files) {
        const encodedContent = btoa(unescape(encodeURIComponent(file.content)));
        
        // Check if file exists
        let sha: string | undefined;
        try {
          const existing = await api.octokit.rest.repos.getContent({
            owner: user.login,
            repo: repoName,
            path: file.path,
          });
          if ('sha' in existing.data) {
            sha = existing.data.sha;
          }
        } catch {
          // File doesn't exist
        }

        await api.octokit.rest.repos.createOrUpdateFileContents({
          owner: user.login,
          repo: repoName,
          path: file.path,
          message: `Update ${file.path} via Telescope`,
          content: encodedContent,
          sha,
        });
      }

      // Enable GitHub Pages if not already enabled
      try {
        await api.octokit.rest.repos.createPagesSite({
          owner: user.login,
          repo: repoName,
          source: {
            branch: 'main',
            path: '/',
          },
        });
      } catch {
        // Pages might already be enabled
      }

      set({ isDirty: false });
      await get().checkPortfolioRepoStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deploy portfolio to GitHub';
      set({ deployError: message });
      throw error;
    } finally {
      set({ isDeploying: false });
    }
  },

  // Reset
  reset: () =>
    set({
      selectedTemplate: null,
      customization: null,
      portfolioCustomization: null,
      isDirty: false,
      previewMarkdown: '',
      editorMode: 'form',
      deployError: null,
    }),
}));

/**
 * Generate portfolio configuration files for GitHub deployment
 */
function generatePortfolioConfig(
  customization: PortfolioCustomization,
  template: PortfolioTemplate,
  user: { login: string; name: string | null },
) {
  const files: { path: string; content: string }[] = [];

  // Generate profile JSON files (similar to dev-portfolio structure)
  
  // home.json
  const homeSection = customization.sections.find((s) => s.type === 'home');
  if (homeSection) {
    files.push({
      path: 'public/profile/home.json',
      content: JSON.stringify(homeSection.data, null, 2),
    });
  }

  // about.json
  const aboutSection = customization.sections.find((s) => s.type === 'about');
  if (aboutSection) {
    files.push({
      path: 'public/profile/about.json',
      content: JSON.stringify({
        about: (aboutSection.data as { content?: string }).content || '',
        imageSource: (aboutSection.data as { imageSource?: string }).imageSource || '',
      }, null, 2),
    });
  }

  // skills.json
  const skillsSection = customization.sections.find((s) => s.type === 'skills');
  if (skillsSection) {
    files.push({
      path: 'public/profile/skills.json',
      content: JSON.stringify(skillsSection.data, null, 2),
    });
  }

  // education.json
  const educationSection = customization.sections.find((s) => s.type === 'education');
  if (educationSection) {
    files.push({
      path: 'public/profile/education.json',
      content: JSON.stringify(educationSection.data, null, 2),
    });
  }

  // experiences.json
  const experienceSection = customization.sections.find((s) => s.type === 'experience');
  if (experienceSection) {
    files.push({
      path: 'public/profile/experiences.json',
      content: JSON.stringify(experienceSection.data, null, 2),
    });
  }

  // projects.json
  const projectsSection = customization.sections.find((s) => s.type === 'projects');
  if (projectsSection) {
    files.push({
      path: 'public/profile/projects.json',
      content: JSON.stringify(projectsSection.data, null, 2),
    });
  }

  // social.json
  files.push({
    path: 'public/profile/social.json',
    content: JSON.stringify(customization.social, null, 2),
  });

  // navbar.json
  files.push({
    path: 'public/profile/navbar.json',
    content: JSON.stringify(customization.nav, null, 2),
  });

  // routes.json
  const routes = {
    sections: customization.sections
      .filter((s) => s.enabled && s.type !== 'home')
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        component: s.type.charAt(0).toUpperCase() + s.type.slice(1),
        path: `/${s.type}`,
        headerTitle: s.title,
      })),
  };
  files.push({
    path: 'public/profile/routes.json',
    content: JSON.stringify(routes, null, 2),
  });

  // Generate a README for the portfolio repo
  files.push({
    path: 'README.md',
    content: `# ${user.name || user.login}'s Portfolio

This portfolio was created using [Telescope](https://github.com/telescope) Profile Builder.

## Live Site

Visit: https://${user.login}.github.io

## Template

Based on: ${template.name}

## Customization

To customize this portfolio:
1. Edit the JSON files in \`public/profile/\`
2. Replace images in \`public/images/\`
3. Push changes to trigger a new deployment

---

Built with ❤️ using Telescope
`,
  });

  return { files };
}
