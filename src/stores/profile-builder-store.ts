import { create } from 'zustand';
import {
  ProfileTemplate,
  TemplateCustomization,
  WidgetConfig,
  ProfileRepoStatus,
  ReadmeBackup,
} from '../lib/profile-builder/types';
import { ProfileRepoManager } from '../lib/profile-builder/profile-repo-manager';
import { TemplateEngine } from '../lib/profile-builder/template-engine';
import { allTemplates } from '../lib/profile-builder/templates';
import { useAuthStore } from './auth-store';
import { useUserStore } from './user-store';
import { GitHubAPI } from '../lib/github/api';

interface ProfileBuilderState {
  // Templates
  templates: ProfileTemplate[];
  selectedTemplate: ProfileTemplate | null;
  filterCategory: string | null;
  searchQuery: string;

  // Customization
  customization: TemplateCustomization | null;
  isDirty: boolean;

  // Preview
  previewMarkdown: string;
  editorMode: 'form' | 'code' | 'split';

  // GitHub integration
  profileRepoStatus: ProfileRepoStatus | null;
  backups: ReadmeBackup[];
  isDeploying: boolean;
  deployError: string | null;

  // Loading states
  isLoadingStatus: boolean;
  isLoadingBackups: boolean;

  // Actions
  selectTemplate: (template: ProfileTemplate) => void;
  setFilterCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Customization actions
  updateVariable: (key: string, value: string | string[]) => void;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  toggleWidget: (widgetId: string) => void;
  setRawMarkdown: (markdown: string) => void;
  setEditorMode: (mode: 'form' | 'code' | 'split') => void;

  // Preview
  generatePreview: () => void;

  // GitHub actions
  checkProfileRepoStatus: () => Promise<void>;
  createProfileRepo: (description?: string) => Promise<void>;
  deployToGitHub: (commitMessage?: string) => Promise<void>;
  loadBackups: () => Promise<void>;
  restoreFromBackup: (backupSha: string) => Promise<void>;

  // Reset
  reset: () => void;
}

export const useProfileBuilderStore = create<ProfileBuilderState>((set, get) => ({
  // Initial state
  templates: allTemplates,
  selectedTemplate: null,
  filterCategory: null,
  searchQuery: '',

  customization: null,
  isDirty: false,

  previewMarkdown: '',
  editorMode: 'form',

  profileRepoStatus: null,
  backups: [],
  isDeploying: false,
  deployError: null,

  isLoadingStatus: false,
  isLoadingBackups: false,

  // Template selection
  selectTemplate: (template) => {
    const user = useUserStore.getState().user;

    if (!user) return;

    // Initialize customization with defaults
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
      isDirty: false,
    });

    // Generate initial preview
    get().generatePreview();
  },

  setFilterCategory: (category) => set({ filterCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Customization
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

  // Preview generation
  generatePreview: () => {
    const { selectedTemplate, customization } = get();
    if (!selectedTemplate || !customization) return;

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

  reset: () =>
    set({
      selectedTemplate: null,
      customization: null,
      isDirty: false,
      previewMarkdown: '',
      editorMode: 'form',
      deployError: null,
    }),
}));
