/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfileBuilderStore } from '../../src/stores/profile-builder-store';

// Mock dependencies
vi.mock('../../src/lib/profile-builder/profile-repo-manager', () => ({
  ProfileRepoManager: vi.fn().mockImplementation(() => ({
    checkProfileRepo: vi.fn(),
    createProfileRepo: vi.fn(),
    updateReadme: vi.fn(),
    listReadmeHistory: vi.fn(),
    restoreReadme: vi.fn(),
  })),
}));

vi.mock('../../src/lib/profile-builder/template-engine', () => ({
  TemplateEngine: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
  })),
}));

vi.mock('../../src/lib/profile-builder/templates', () => ({
  allTemplates: [
    {
      id: 'test-template',
      name: 'Test Template',
      description: 'A test template',
      category: 'minimalist',
      preview: '',
      author: 'Test',
      stars: 0,
      markdown: '# {{name}}',
      variables: [],
      widgets: [
        {
          id: 'header',
          name: 'Header',
          description: 'Header widget',
          marker: '<!-- WIDGET:text -->',
          allowedTypes: ['text'],
          defaultWidget: 'text',
        },
      ],
      tags: [],
      difficulty: 'beginner',
      lastUpdated: '2024-01-01',
      mode: 'readme',
    },
    {
      id: 'test-portfolio-template',
      name: 'Test Portfolio Template',
      description: 'A test portfolio template',
      category: 'professional',
      preview: '',
      author: 'Test',
      stars: 0,
      tags: [],
      difficulty: 'beginner',
      lastUpdated: '2024-01-01',
      mode: 'portfolio',
      defaultSections: [
        {
          id: 'home',
          type: 'home',
          title: 'Home',
          enabled: true,
          order: 0,
          data: { name: '', roles: [] },
        },
        {
          id: 'about',
          type: 'about',
          title: 'About',
          enabled: true,
          order: 1,
          data: { content: '' },
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          enabled: true,
          order: 2,
          data: { intro: '', skills: [] },
        },
      ],
      defaultTheme: {
        name: 'Dark',
        accentColor: '#3D84C6',
        background: '#121212',
        color: '#eeeeee',
        cardBackground: '#1e1e1e',
        cardBorderColor: '#333333',
        mode: 'dark',
      },
      defaultNav: {
        sections: [
          { title: 'Home', href: '/' },
          { title: 'About', href: '/about' },
        ],
      },
      variables: [],
      features: ['dark-mode'],
    },
  ],
  readmeTemplates: [
    {
      id: 'test-template',
      name: 'Test Template',
      description: 'A test template',
      category: 'minimalist',
      preview: '',
      author: 'Test',
      stars: 0,
      markdown: '# {{name}}',
      variables: [],
      widgets: [
        {
          id: 'header',
          name: 'Header',
          description: 'Header widget',
          marker: '<!-- WIDGET:text -->',
          allowedTypes: ['text'],
          defaultWidget: 'text',
        },
      ],
      tags: [],
      difficulty: 'beginner',
      lastUpdated: '2024-01-01',
      mode: 'readme',
    },
  ],
  portfolioTemplates: [
    {
      id: 'test-portfolio-template',
      name: 'Test Portfolio Template',
      description: 'A test portfolio template',
      category: 'professional',
      preview: '',
      author: 'Test',
      stars: 0,
      tags: [],
      difficulty: 'beginner',
      lastUpdated: '2024-01-01',
      mode: 'portfolio',
      defaultSections: [
        {
          id: 'home',
          type: 'home',
          title: 'Home',
          enabled: true,
          order: 0,
          data: { name: '', roles: [] },
        },
        {
          id: 'about',
          type: 'about',
          title: 'About',
          enabled: true,
          order: 1,
          data: { content: '' },
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          enabled: true,
          order: 2,
          data: { intro: '', skills: [] },
        },
      ],
      defaultTheme: {
        name: 'Dark',
        accentColor: '#3D84C6',
        background: '#121212',
        color: '#eeeeee',
        cardBackground: '#1e1e1e',
        cardBorderColor: '#333333',
        mode: 'dark',
      },
      defaultNav: {
        sections: [
          { title: 'Home', href: '/' },
          { title: 'About', href: '/about' },
        ],
      },
      variables: [],
      features: ['dark-mode'],
    },
  ],
}));

vi.mock('../../src/stores/auth-store', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../src/stores/user-store', () => ({
  useUserStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../src/lib/github/api', () => ({
  GitHubAPI: vi.fn(),
}));

import { ProfileRepoManager } from '../../src/lib/profile-builder/profile-repo-manager';
import { TemplateEngine } from '../../src/lib/profile-builder/template-engine';
import { useAuthStore } from '../../src/stores/auth-store';
import { useUserStore } from '../../src/stores/user-store';

describe('useProfileBuilderStore', () => {
  const mockProfileRepoManager = ProfileRepoManager as Mock;
  const mockTemplateEngine = TemplateEngine as any;
  const mockAuthStore = useAuthStore as any;
  const mockUserStore = useUserStore as any;

  beforeEach(() => {
    useProfileBuilderStore.setState({
      builderMode: 'readme',
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
    });

    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useProfileBuilderStore());

    expect(result.current.templates).toHaveLength(2);
    expect(result.current.builderMode).toBe('readme');
    expect(result.current.selectedTemplate).toBeNull();
    expect(result.current.customization).toBeNull();
    expect(result.current.portfolioCustomization).toBeNull();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.previewMarkdown).toBe('');
    expect(result.current.editorMode).toBe('form');
  });

  describe('Mode Selection', () => {
    it('should switch to portfolio mode', () => {
      const { result } = renderHook(() => useProfileBuilderStore());

      act(() => {
        result.current.setBuilderMode('portfolio');
      });

      expect(result.current.builderMode).toBe('portfolio');
      expect(result.current.selectedTemplate).toBeNull();
      expect(result.current.customization).toBeNull();
      expect(result.current.portfolioCustomization).toBeNull();
    });

    it('should switch back to readme mode', () => {
      const { result } = renderHook(() => useProfileBuilderStore());

      act(() => {
        result.current.setBuilderMode('portfolio');
      });
      act(() => {
        result.current.setBuilderMode('readme');
      });

      expect(result.current.builderMode).toBe('readme');
    });

    it('should filter templates by mode', () => {
      const { result } = renderHook(() => useProfileBuilderStore());

      // In README mode, should return README templates
      act(() => {
        result.current.setBuilderMode('readme');
      });
      let filtered = result.current.getFilteredTemplates();
      expect(filtered.length).toBe(1);
      expect(filtered[0].mode).toBe('readme');

      // In portfolio mode, should return portfolio templates
      act(() => {
        result.current.setBuilderMode('portfolio');
      });
      filtered = result.current.getFilteredTemplates();
      expect(filtered.length).toBe(1);
      expect(filtered[0].mode).toBe('portfolio');
    });
  });

  describe('README Template Selection', () => {
    it('should select README template and initialize customization', () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        bio: 'Test bio',
        location: 'Test City',
        email: 'test@example.com',
        blog: 'https://example.com',
      };
      mockUserStore.getState.mockReturnValue({ user: mockUser });

      const mockTemplateEngineInstance = {
        render: vi.fn().mockReturnValue('# Test User'),
      };
      mockTemplateEngine.mockImplementation(() => mockTemplateEngineInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      act(() => {
        result.current.selectTemplate(result.current.templates[0]);
      });

      expect(result.current.selectedTemplate).toEqual(result.current.templates[0]);
      expect(result.current.customization).toBeDefined();
      expect(result.current.customization?.variables.username).toBe('testuser');
      expect(result.current.customization?.variables.name).toBe('Test User');
      expect(result.current.customization?.variables.aboutMe).toBe('Test bio');
      expect(result.current.previewMarkdown).toBe('# Test User');
      expect(result.current.portfolioCustomization).toBeNull();
      expect(result.current.builderMode).toBe('readme');
    });
  });

  describe('Portfolio Template Selection', () => {
    it('should select portfolio template and initialize portfolioCustomization', () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        bio: 'I am a developer',
      };
      mockUserStore.getState.mockReturnValue({ user: mockUser });

      const { result } = renderHook(() => useProfileBuilderStore());

      const portfolioTemplate = result.current.templates.find((t: any) => t.mode === 'portfolio');

      act(() => {
        result.current.selectTemplate(portfolioTemplate!);
      });

      expect(result.current.selectedTemplate).toEqual(portfolioTemplate);
      expect(result.current.portfolioCustomization).toBeDefined();
      expect(result.current.portfolioCustomization?.templateId).toBe('test-portfolio-template');
      expect(result.current.portfolioCustomization?.sections).toHaveLength(3);
      expect(result.current.portfolioCustomization?.theme.name).toBe('Dark');
      expect(result.current.portfolioCustomization?.repoName).toBe('testuser.github.io');
      expect(result.current.customization).toBeNull();
      expect(result.current.builderMode).toBe('portfolio');
    });

    it('should auto-fill user data into portfolio sections', () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
        bio: 'I am a developer',
      };
      mockUserStore.getState.mockReturnValue({ user: mockUser });

      const { result } = renderHook(() => useProfileBuilderStore());
      const portfolioTemplate = result.current.templates.find((t: any) => t.mode === 'portfolio');

      act(() => {
        result.current.selectTemplate(portfolioTemplate!);
      });

      const homeSection = result.current.portfolioCustomization?.sections.find(s => s.type === 'home');
      expect(homeSection?.data.name).toBe('Test User');

      const aboutSection = result.current.portfolioCustomization?.sections.find(s => s.type === 'about');
      expect(aboutSection?.data.content).toBe('I am a developer');
    });

    it('should initialize social links with GitHub profile', () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
      };
      mockUserStore.getState.mockReturnValue({ user: mockUser });

      const { result } = renderHook(() => useProfileBuilderStore());
      const portfolioTemplate = result.current.templates.find((t: any) => t.mode === 'portfolio');

      act(() => {
        result.current.selectTemplate(portfolioTemplate!);
      });

      const githubLink = result.current.portfolioCustomization?.social.social.find(s => s.network === 'github');
      expect(githubLink?.href).toBe('https://github.com/testuser');
    });
  });

  describe('Portfolio Customization Actions', () => {
    const setupPortfolioState = () => {
      const mockUser = {
        login: 'testuser',
        name: 'Test User',
      };
      mockUserStore.getState.mockReturnValue({ user: mockUser });

      const { result } = renderHook(() => useProfileBuilderStore());
      const portfolioTemplate = result.current.templates.find((t: any) => t.mode === 'portfolio');

      act(() => {
        result.current.selectTemplate(portfolioTemplate!);
      });

      return result;
    };

    it('should update portfolio section', () => {
      const result = setupPortfolioState();

      act(() => {
        result.current.updatePortfolioSection('home', { title: 'Welcome' });
      });

      const homeSection = result.current.portfolioCustomization?.sections.find(s => s.id === 'home');
      expect(homeSection?.title).toBe('Welcome');
      expect(result.current.isDirty).toBe(true);
    });

    it('should update portfolio section data', () => {
      const result = setupPortfolioState();

      act(() => {
        result.current.updatePortfolioSection('home', { data: { name: 'Updated Name', roles: ['Developer'] } });
      });

      const homeSection = result.current.portfolioCustomization?.sections.find(s => s.id === 'home');
      expect(homeSection?.data.name).toBe('Updated Name');
      expect(homeSection?.data.roles).toContain('Developer');
    });

    it('should toggle portfolio section', () => {
      const result = setupPortfolioState();

      const aboutSection = result.current.portfolioCustomization?.sections.find(s => s.type === 'about');
      expect(aboutSection?.enabled).toBe(true);

      act(() => {
        result.current.togglePortfolioSection('about');
      });

      const updatedSection = result.current.portfolioCustomization?.sections.find(s => s.id === 'about');
      expect(updatedSection?.enabled).toBe(false);
      expect(result.current.isDirty).toBe(true);
    });

    it('should reorder portfolio sections', () => {
      const result = setupPortfolioState();

      const reorderedSections = [
        result.current.portfolioCustomization!.sections[2], // skills
        result.current.portfolioCustomization!.sections[0], // home
        result.current.portfolioCustomization!.sections[1], // about
      ];

      act(() => {
        result.current.reorderPortfolioSections(reorderedSections);
      });

      expect(result.current.portfolioCustomization?.sections[0].order).toBe(0);
      expect(result.current.portfolioCustomization?.sections[1].order).toBe(1);
      expect(result.current.portfolioCustomization?.sections[2].order).toBe(2);
      expect(result.current.isDirty).toBe(true);
    });

    it('should update portfolio theme', () => {
      const result = setupPortfolioState();

      act(() => {
        result.current.updatePortfolioTheme({ accentColor: '#ff0000', mode: 'light' });
      });

      expect(result.current.portfolioCustomization?.theme.accentColor).toBe('#ff0000');
      expect(result.current.portfolioCustomization?.theme.mode).toBe('light');
      expect(result.current.isDirty).toBe(true);
    });

    it('should update portfolio nav', () => {
      const result = setupPortfolioState();

      act(() => {
        result.current.updatePortfolioNav({
          sections: [
            { title: 'Home', href: '/' },
            { title: 'About', href: '/about' },
            { title: 'Contact', href: '/contact' },
          ],
        });
      });

      expect(result.current.portfolioCustomization?.nav.sections).toHaveLength(3);
      expect(result.current.isDirty).toBe(true);
    });

    it('should update portfolio social links', () => {
      const result = setupPortfolioState();

      act(() => {
        result.current.updatePortfolioSocial({
          social: [
            { network: 'github', href: 'https://github.com/testuser' },
            { network: 'linkedin', href: 'https://linkedin.com/in/testuser' },
          ],
        });
      });

      expect(result.current.portfolioCustomization?.social.social).toHaveLength(2);
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('README Customization', () => {
    it('should update variable', () => {
      const { result } = renderHook(() => useProfileBuilderStore());

      // Set initial customization
      act(() => {
        useProfileBuilderStore.setState({
          customization: {
            templateId: 'test',
            variables: { name: 'Old Name' },
            widgets: [],
          },
        });
      });

      act(() => {
        result.current.updateVariable('name', 'New Name');
      });

      expect(result.current.customization?.variables.name).toBe('New Name');
      expect(result.current.isDirty).toBe(true);
    });

    it('should update widget', () => {
      const { result } = renderHook(() => useProfileBuilderStore());

      // Set initial customization
      act(() => {
        useProfileBuilderStore.setState({
          customization: {
            templateId: 'test',
            variables: {},
            widgets: [{ id: 'header', type: 'github-stats', enabled: true, options: {} }],
          },
        });
      });

      act(() => {
        result.current.updateWidget('header', { enabled: false });
      });

      expect(result.current.customization?.widgets[0].enabled).toBe(false);
      expect(result.current.isDirty).toBe(true);
    });

    it('should toggle widget', () => {
      const { result } = renderHook(() => useProfileBuilderStore());

      // Set initial customization
      act(() => {
        useProfileBuilderStore.setState({
          customization: {
            templateId: 'test',
            variables: {},
            widgets: [{ id: 'header', type: 'github-stats', enabled: true, options: {} }],
          },
        });
      });

      act(() => {
        result.current.toggleWidget('header');
      });

      expect(result.current.customization?.widgets[0].enabled).toBe(false);
    });

    it('should set raw markdown', () => {
      const { result } = renderHook(() => useProfileBuilderStore());

      // Set initial customization
      act(() => {
        useProfileBuilderStore.setState({
          customization: {
            templateId: 'test',
            variables: {},
            widgets: [],
          },
        });
      });

      act(() => {
        result.current.setRawMarkdown('# Custom Markdown');
      });

      expect(result.current.previewMarkdown).toBe('# Custom Markdown');
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe('GitHub Integration', () => {
    it('should check profile repo status', async () => {
      const mockUser = { login: 'testuser' };
      const mockToken = 'test-token';
      const mockStatus = { exists: true, readmeSha: 'abc123' };

      mockUserStore.getState.mockReturnValue({ user: mockUser });
      mockAuthStore.getState.mockReturnValue({ token: mockToken });

      const mockManagerInstance = {
        checkProfileRepo: vi.fn().mockResolvedValue(mockStatus),
      };
      mockProfileRepoManager.mockImplementation(() => mockManagerInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      await act(async () => {
        await result.current.checkProfileRepoStatus();
      });

      expect(result.current.profileRepoStatus).toEqual(mockStatus);
      expect(result.current.isLoadingStatus).toBe(false);
    });

    it('should create profile repo', async () => {
      const mockUser = { login: 'testuser' };
      const mockToken = 'test-token';

      mockUserStore.getState.mockReturnValue({ user: mockUser });
      mockAuthStore.getState.mockReturnValue({ token: mockToken });

      const mockManagerInstance = {
        createProfileRepo: vi.fn().mockResolvedValue(undefined),
        checkProfileRepo: vi.fn().mockResolvedValue({ exists: true }),
      };
      mockProfileRepoManager.mockImplementation(() => mockManagerInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      await act(async () => {
        await result.current.createProfileRepo('Test description');
      });

      expect(mockManagerInstance.createProfileRepo).toHaveBeenCalledWith('testuser', 'Test description');
      expect(result.current.isDeploying).toBe(false);
    });

    it('should load current profile', async () => {
      const mockUser = { login: 'testuser', name: 'Test User' };
      const mockToken = 'test-token';
      const mockStatus = { exists: true, readmeContent: '# Current Profile' };

      mockUserStore.getState.mockReturnValue({ user: mockUser });
      mockAuthStore.getState.mockReturnValue({ token: mockToken });

      // Mock checkProfileRepoStatus to populate profileRepoStatus
      const mockManagerInstance = {
        checkProfileRepo: vi.fn().mockResolvedValue(mockStatus),
      };
      mockProfileRepoManager.mockImplementation(() => mockManagerInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      // First ensure status is loaded
      await act(async () => {
        await result.current.checkProfileRepoStatus();
      });

      await act(async () => {
        await result.current.loadCurrentProfile();
      });

      expect(result.current.selectedTemplate?.id).toBe('current-profile');
      expect(result.current.previewMarkdown).toBe('# Current Profile');
      expect(result.current.editorMode).toBe('code');
      expect(result.current.builderMode).toBe('readme');
    });

    it('should deploy to GitHub', async () => {
      const mockUser = { login: 'testuser' };
      const mockToken = 'test-token';

      mockUserStore.getState.mockReturnValue({ user: mockUser });
      mockAuthStore.getState.mockReturnValue({ token: mockToken });

      const mockManagerInstance = {
        updateReadme: vi.fn().mockResolvedValue(undefined),
        checkProfileRepo: vi.fn().mockResolvedValue({ exists: true, readmeSha: 'newsha' }),
      };
      mockProfileRepoManager.mockImplementation(() => mockManagerInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      // Set up state with markdown to deploy
      act(() => {
        useProfileBuilderStore.setState({
          previewMarkdown: '# My Profile',
          profileRepoStatus: { exists: true, readmeSha: 'oldsha' },
          isDirty: true,
        });
      });

      await act(async () => {
        await result.current.deployToGitHub('Test commit');
      });

      expect(mockManagerInstance.updateReadme).toHaveBeenCalledWith(
        'testuser',
        '# My Profile',
        'Test commit',
        'oldsha',
      );
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isDeploying).toBe(false);
    });

    it('should handle deploy error', async () => {
      const mockUser = { login: 'testuser' };
      const mockToken = 'test-token';

      mockUserStore.getState.mockReturnValue({ user: mockUser });
      mockAuthStore.getState.mockReturnValue({ token: mockToken });

      const mockManagerInstance = {
        updateReadme: vi.fn().mockRejectedValue(new Error('Deploy failed')),
      };
      mockProfileRepoManager.mockImplementation(() => mockManagerInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      act(() => {
        useProfileBuilderStore.setState({
          previewMarkdown: '# My Profile',
          profileRepoStatus: { exists: true, readmeSha: 'sha' },
        });
      });

      await act(async () => {
        try {
          await result.current.deployToGitHub();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.deployError).toBe('Deploy failed');
      expect(result.current.isDeploying).toBe(false);
    });

    it('should load backups', async () => {
      const mockUser = { login: 'testuser' };
      const mockToken = 'test-token';
      const mockBackups = [
        { sha: 'sha1', message: 'Update 1', date: '2024-01-01' },
        { sha: 'sha2', message: 'Update 2', date: '2024-01-02' },
      ];

      mockUserStore.getState.mockReturnValue({ user: mockUser });
      mockAuthStore.getState.mockReturnValue({ token: mockToken });

      const mockManagerInstance = {
        listReadmeHistory: vi.fn().mockResolvedValue(mockBackups),
      };
      mockProfileRepoManager.mockImplementation(() => mockManagerInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      await act(async () => {
        await result.current.loadBackups();
      });

      expect(result.current.backups).toEqual(mockBackups);
      expect(result.current.isLoadingBackups).toBe(false);
    });

    it('should restore from backup', async () => {
      const mockUser = { login: 'testuser' };
      const mockToken = 'test-token';

      mockUserStore.getState.mockReturnValue({ user: mockUser });
      mockAuthStore.getState.mockReturnValue({ token: mockToken });

      const mockManagerInstance = {
        restoreReadme: vi.fn().mockResolvedValue(undefined),
        checkProfileRepo: vi.fn().mockResolvedValue({ exists: true, readmeSha: 'restored' }),
      };
      mockProfileRepoManager.mockImplementation(() => mockManagerInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      act(() => {
        useProfileBuilderStore.setState({
          profileRepoStatus: { exists: true, readmeSha: 'currentsha' },
        });
      });

      await act(async () => {
        await result.current.restoreFromBackup('backupsha');
      });

      expect(mockManagerInstance.restoreReadme).toHaveBeenCalledWith('testuser', 'backupsha', 'currentsha');
      expect(result.current.isDeploying).toBe(false);
    });

    it('should generate preview', () => {
      const mockUser = { login: 'testuser' };
      mockUserStore.getState.mockReturnValue({ user: mockUser });

      const mockTemplateEngineInstance = {
        render: vi.fn().mockReturnValue('# Generated Preview'),
      };
      mockTemplateEngine.mockImplementation(() => mockTemplateEngineInstance);

      const { result } = renderHook(() => useProfileBuilderStore());

      // Select a README template first
      const readmeTemplate = result.current.templates.find((t: any) => t.mode === 'readme');

      act(() => {
        result.current.selectTemplate(readmeTemplate!);
      });

      // The preview should be generated when template is selected
      expect(mockTemplateEngineInstance.render).toHaveBeenCalled();
    });
  });

  describe('Reset', () => {
    it('should reset store', () => {
      const { result } = renderHook(() => useProfileBuilderStore());

      act(() => {
        useProfileBuilderStore.setState({
          selectedTemplate: { id: 'test' } as any,
          customization: { templateId: 'test' } as any,
          portfolioCustomization: { templateId: 'test-portfolio' } as any,
          isDirty: true,
          previewMarkdown: '# test',
          editorMode: 'code',
          deployError: 'error',
        });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.selectedTemplate).toBeNull();
      expect(result.current.customization).toBeNull();
      expect(result.current.portfolioCustomization).toBeNull();
      expect(result.current.isDirty).toBe(false);
      expect(result.current.previewMarkdown).toBe('');
      expect(result.current.editorMode).toBe('form');
      expect(result.current.deployError).toBeNull();
    });

    it('should reset portfolio customization when switching modes', () => {
      const mockUser = { login: 'testuser', name: 'Test User' };
      mockUserStore.getState.mockReturnValue({ user: mockUser });

      const { result } = renderHook(() => useProfileBuilderStore());

      // Select portfolio template
      const portfolioTemplate = result.current.templates.find((t: any) => t.mode === 'portfolio');
      act(() => {
        result.current.selectTemplate(portfolioTemplate!);
      });

      expect(result.current.portfolioCustomization).not.toBeNull();

      // Switch to readme mode
      act(() => {
        result.current.setBuilderMode('readme');
      });

      expect(result.current.portfolioCustomization).toBeNull();
      expect(result.current.selectedTemplate).toBeNull();
    });
  });
});