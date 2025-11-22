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
      category: 'minimal',
      widgets: [
        {
          id: 'header',
          name: 'Header',
          allowedTypes: ['text'],
          defaultWidget: 'text',
        },
      ],
      template: '# {{name}}',
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
    });

    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useProfileBuilderStore());

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.selectedTemplate).toBeNull();
    expect(result.current.customization).toBeNull();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.previewMarkdown).toBe('');
    expect(result.current.editorMode).toBe('form');
  });

  it('should select template and initialize customization', () => {
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
  });

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
    };
    mockProfileRepoManager.mockImplementation(() => mockManagerInstance);

    const { result } = renderHook(() => useProfileBuilderStore());

    await act(async () => {
      await result.current.createProfileRepo('Test description');
    });

    expect(mockManagerInstance.createProfileRepo).toHaveBeenCalledWith('testuser', 'Test description');
    expect(result.current.isDeploying).toBe(false);
  });

  it('should reset store', () => {
    const { result } = renderHook(() => useProfileBuilderStore());

    act(() => {
      useProfileBuilderStore.setState({
        selectedTemplate: { id: 'test' } as any,
        customization: { templateId: 'test' } as any,
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
    expect(result.current.isDirty).toBe(false);
    expect(result.current.previewMarkdown).toBe('');
    expect(result.current.editorMode).toBe('form');
    expect(result.current.deployError).toBeNull();
  });
});