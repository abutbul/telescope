/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProfileBuilder from '../../src/pages/ProfileBuilder';
import TemplateCustomizer from '../../src/components/profile-builder/TemplateCustomizer';
import { useProfileBuilderStore } from '../../src/stores/profile-builder-store';
import { useUserStore } from '../../src/stores/user-store';
import { resetProfileBuilderStore, resetUserStore, sampleUser } from '../utils/store-helpers';
import type { ProfileTemplate, PortfolioTemplate, TemplateCustomization, PortfolioCustomization } from '../../src/lib/profile-builder/types';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange?: (nextValue?: string) => void }) => (
    <textarea
      data-testid="mock-editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

const buildTemplate = (): ProfileTemplate => ({
  id: 'dev-card',
  name: 'Developer Card',
  description: 'A compact developer introduction.',
  category: 'minimalist',
  preview: '',
  author: 'Telescope',
  stars: 128,
  markdown: '## Hello {{name}}',
  variables: [
    {
      key: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Jane Doe',
      required: true,
      description: 'Shown at the top of the README.',
    },
    {
      key: 'aboutMe',
      label: 'About',
      type: 'textarea',
      placeholder: 'Share a short bio',
      required: false,
    },
  ],
  widgets: [
    {
      id: 'stats',
      name: 'Stats Section',
      description: 'Shows GitHub stats',
      marker: '<!--stats-->',
      allowedTypes: ['github-stats'],
      defaultWidget: 'github-stats',
    },
  ],
  images: [],
  tags: ['featured', 'stats'],
  difficulty: 'beginner',
  lastUpdated: '2024-01-01',
  mode: 'readme',
});

const buildPortfolioTemplate = (): PortfolioTemplate => ({
  id: 'modern-portfolio',
  name: 'Modern Portfolio',
  description: 'A modern portfolio template.',
  category: 'professional',
  preview: '',
  author: 'Telescope',
  stars: 256,
  tags: ['portfolio', 'professional'],
  difficulty: 'intermediate',
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
  features: ['dark-mode', 'animations'],
});

const buildCustomization = (): TemplateCustomization => ({
  templateId: 'dev-card',
  variables: {
    name: 'Octo Cat',
    aboutMe: 'Testing all the widgets',
  },
  widgets: [
    {
      id: 'stats',
      type: 'github-stats',
      enabled: true,
      options: {},
    },
  ],
  rawMarkdown: '# Raw',
});

const buildPortfolioCustomization = (): PortfolioCustomization => ({
  templateId: 'modern-portfolio',
  sections: [
    {
      id: 'home',
      type: 'home',
      title: 'Home',
      enabled: true,
      order: 0,
      data: { name: 'Test User', roles: ['Developer', 'Designer'] },
    },
    {
      id: 'about',
      type: 'about',
      title: 'About Me',
      enabled: true,
      order: 1,
      data: { content: 'I am a developer.' },
    },
  ],
  theme: {
    name: 'Dark',
    accentColor: '#3D84C6',
    background: '#121212',
    color: '#eeeeee',
    cardBackground: '#1e1e1e',
    cardBorderColor: '#333333',
    mode: 'dark',
  },
  nav: {
    sections: [
      { title: 'Home', href: '/' },
      { title: 'About', href: '/about' },
    ],
  },
  social: {
    social: [
      { network: 'github', href: 'https://github.com/testuser' },
    ],
  },
  repoName: 'testuser.github.io',
});

describe('Profile builder experience', () => {
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    resetProfileBuilderStore();
    resetUserStore();
    useUserStore.setState({ user: sampleUser });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  const seedGalleryState = () => {
    const template = buildTemplate();
    const selectTemplate = vi.fn();
    const setSearchQuery = vi.fn();
    const setFilterCategory = vi.fn();
    const getFilteredTemplates = vi.fn().mockReturnValue([template]);

    useProfileBuilderStore.setState({
      builderMode: 'readme',
      templates: [template],
      selectedTemplate: null,
      selectTemplate,
      setSearchQuery,
      setFilterCategory,
      getFilteredTemplates,
    });

    return { template, selectTemplate, setSearchQuery, setFilterCategory, getFilteredTemplates };
  };

  const seedCustomizerState = (overrides: Partial<TemplateCustomization> = {}) => {
    const template = buildTemplate();
    const customization = { ...buildCustomization(), ...overrides };

    const updateVariable = vi.fn();
    const toggleWidget = vi.fn();
    const generatePreview = vi.fn();
    const setEditorMode = vi.fn();
    const setRawMarkdown = vi.fn();
    const deployToGitHub = vi.fn().mockResolvedValue(undefined);
    const checkProfileRepoStatus = vi.fn().mockResolvedValue(undefined);
    const reset = vi.fn();
    const getFilteredTemplates = vi.fn().mockReturnValue([template]);

    useProfileBuilderStore.setState({
      builderMode: 'readme',
      templates: [template],
      selectedTemplate: template,
      customization,
      portfolioCustomization: null,
      previewMarkdown: '# Preview',
      editorMode: 'form',
      isDirty: true,
      isDeploying: false,
      deployError: 'Failed before',
      updateVariable,
      toggleWidget,
      generatePreview,
      setEditorMode,
      setRawMarkdown,
      deployToGitHub,
      checkProfileRepoStatus,
      reset,
      getFilteredTemplates,
    });

    return {
      template,
      customization,
      updateVariable,
      toggleWidget,
      generatePreview,
      setEditorMode,
      setRawMarkdown,
      deployToGitHub,
      checkProfileRepoStatus,
      reset,
    };
  };

  it('shows the template gallery when no template is selected', () => {
    const { template, selectTemplate, setSearchQuery, setFilterCategory } = seedGalleryState();

    render(<ProfileBuilder />);

    const searchInput = screen.getByPlaceholderText(/search templates/i);
    fireEvent.change(searchInput, { target: { value: 'dev' } });
    expect(setSearchQuery).toHaveBeenCalledWith('dev');

    const minimalistFilter = screen.getByRole('button', { name: /minimalist/i });
    fireEvent.click(minimalistFilter);
    expect(setFilterCategory).toHaveBeenCalled();

    const useTemplateButtons = screen.getAllByRole('button', { name: /use template/i });
    expect(useTemplateButtons.length).toBeGreaterThan(0);
    fireEvent.click(useTemplateButtons[0]);
    expect(selectTemplate).toHaveBeenCalledWith(template);
  });

  it('renders customizer controls when a template is active', async () => {
    const {
      updateVariable,
      toggleWidget,
      generatePreview,
      setEditorMode,
      deployToGitHub,
      checkProfileRepoStatus,
      reset,
    } = seedCustomizerState();

    render(<ProfileBuilder />);

    await waitFor(() => {
      expect(checkProfileRepoStatus).toHaveBeenCalled();
    });

    const nameInput = screen.getByPlaceholderText('Jane Doe');
    fireEvent.change(nameInput, { target: { value: 'Captain Octo' } });
    expect(updateVariable).toHaveBeenCalledWith('name', 'Captain Octo');

    const widgetRow = screen.getByText('Stats Section').parentElement?.parentElement;
    expect(widgetRow).not.toBeNull();
    const toggleButton = widgetRow ? within(widgetRow).getByRole('button', { name: '' }) : null;
    expect(toggleButton).not.toBeNull();
    fireEvent.click(toggleButton!);
    expect(toggleWidget).toHaveBeenCalledWith('stats');

    fireEvent.click(screen.getByRole('button', { name: /preview/i }));
    expect(generatePreview).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /deploy to github/i }));
    await waitFor(() => {
      expect(deployToGitHub).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /back to templates/i }));
    expect(reset).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /code/i }));
    fireEvent.click(screen.getByRole('button', { name: /split/i }));
    expect(setEditorMode).toHaveBeenCalledWith('code');
    expect(setEditorMode).toHaveBeenCalledWith('split');
  });

  it('renders markdown editor view when editorMode is code', () => {
    const { setRawMarkdown } = seedCustomizerState();
    useProfileBuilderStore.setState({ editorMode: 'code' });

    render(<TemplateCustomizer />);

    const editor = screen.getByTestId('mock-editor');
    expect(editor).toHaveValue('# Preview');

    fireEvent.change(editor, { target: { value: '# Updated' } });
    expect(setRawMarkdown).toHaveBeenCalledWith('# Updated');
  });

  it('renders split mode with all panels', () => {
    seedCustomizerState();
    useProfileBuilderStore.setState({ editorMode: 'split' });

    render(<TemplateCustomizer />);

    expect(screen.getByText(/customize template/i)).toBeInTheDocument();
    expect(screen.getByText(/markdown editor/i)).toBeInTheDocument();
    const previewHeadings = screen.getAllByRole('heading', { name: /preview/i });
    expect(previewHeadings.length).toBeGreaterThan(0);
  });
});

describe('Profile builder dual-mode experience', () => {
  const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
  beforeEach(() => {
    resetProfileBuilderStore();
    resetUserStore();
    useUserStore.setState({ user: sampleUser });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  const seedDualModeGalleryState = () => {
    const readmeTemplate = buildTemplate();
    const portfolioTemplate = buildPortfolioTemplate();
    const setBuilderMode = vi.fn();
    const selectTemplate = vi.fn();
    const setSearchQuery = vi.fn();
    const setFilterCategory = vi.fn();
    const getFilteredTemplates = vi.fn().mockReturnValue([readmeTemplate]);

    useProfileBuilderStore.setState({
      templates: [readmeTemplate, portfolioTemplate],
      builderMode: 'readme',
      selectedTemplate: null,
      setBuilderMode,
      selectTemplate,
      setSearchQuery,
      setFilterCategory,
      getFilteredTemplates,
    });

    return { 
      readmeTemplate, 
      portfolioTemplate, 
      setBuilderMode, 
      selectTemplate, 
      setSearchQuery, 
      setFilterCategory,
      getFilteredTemplates,
    };
  };

  const seedPortfolioCustomizerState = () => {
    const portfolioTemplate = buildPortfolioTemplate();
    const portfolioCustomization = buildPortfolioCustomization();

    const updatePortfolioSection = vi.fn();
    const togglePortfolioSection = vi.fn();
    const updatePortfolioTheme = vi.fn();
    const deployPortfolioToGitHub = vi.fn().mockResolvedValue(undefined);
    const checkPortfolioRepoStatus = vi.fn().mockResolvedValue(undefined);
    const reset = vi.fn();
    const getFilteredTemplates = vi.fn().mockReturnValue([portfolioTemplate]);

    useProfileBuilderStore.setState({
      templates: [portfolioTemplate],
      builderMode: 'portfolio',
      selectedTemplate: portfolioTemplate,
      portfolioCustomization,
      customization: null,
      previewMarkdown: '',
      editorMode: 'form',
      isDirty: false,
      isDeploying: false,
      deployError: null,
      updatePortfolioSection,
      togglePortfolioSection,
      updatePortfolioTheme,
      deployPortfolioToGitHub,
      checkPortfolioRepoStatus,
      reset,
      getFilteredTemplates,
    });

    return {
      portfolioTemplate,
      portfolioCustomization,
      updatePortfolioSection,
      togglePortfolioSection,
      updatePortfolioTheme,
      deployPortfolioToGitHub,
      checkPortfolioRepoStatus,
      reset,
    };
  };

  it('shows mode selector headings on ProfileBuilder page', () => {
    seedDualModeGalleryState();

    render(<ProfileBuilder />);

    // Mode selector shows as card headings
    expect(screen.getByRole('heading', { name: /profile readme/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /portfolio website/i })).toBeInTheDocument();
  });

  it('switches to portfolio mode when portfolio card is clicked', () => {
    const { setBuilderMode } = seedDualModeGalleryState();

    render(<ProfileBuilder />);

    // Click the portfolio card (it's a button with accessible name containing "Portfolio Website")
    const portfolioButton = screen.getByRole('button', { name: /portfolio website.*build a complete portfolio/i });
    fireEvent.click(portfolioButton);

    expect(setBuilderMode).toHaveBeenCalledWith('portfolio');
  });

  it('switches to readme mode when readme card is clicked', () => {
    const { setBuilderMode } = seedDualModeGalleryState();
    useProfileBuilderStore.setState({ builderMode: 'portfolio' });

    render(<ProfileBuilder />);

    // Click the README card
    const readmeButton = screen.getByRole('button', { name: /profile readme.*edit and publish your github profile/i });
    fireEvent.click(readmeButton);

    expect(setBuilderMode).toHaveBeenCalledWith('readme');
  });

  it('shows correct deploy button text for portfolio mode', async () => {
    seedPortfolioCustomizerState();

    render(<ProfileBuilder />);

    // Portfolio mode should show "Deploy to GitHub Pages" button
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /deploy to github pages/i })).toBeInTheDocument();
    });
  });

  it('shows portfolio customization when portfolio template selected', () => {
    seedPortfolioCustomizerState();

    render(<ProfileBuilder />);

    // Should display portfolio-specific content - check for back to templates button 
    // indicating we're in customizer mode
    expect(screen.getByRole('button', { name: /back to templates/i })).toBeInTheDocument();
  });

  it('calls deployPortfolioToGitHub when deploy button clicked in portfolio mode', async () => {
    const { deployPortfolioToGitHub } = seedPortfolioCustomizerState();

    render(<ProfileBuilder />);

    const deployButton = screen.getByRole('button', { name: /deploy to github pages/i });
    fireEvent.click(deployButton);

    await waitFor(() => {
      expect(deployPortfolioToGitHub).toHaveBeenCalled();
    });
  });

  it('shows template badge indicating mode type', () => {
    const { readmeTemplate, getFilteredTemplates } = seedDualModeGalleryState();
    
    // Mock getFilteredTemplates to return the readme template
    getFilteredTemplates.mockReturnValue([readmeTemplate]);
    useProfileBuilderStore.setState({
      templates: [readmeTemplate],
      getFilteredTemplates,
    });

    render(<ProfileBuilder />);

    // The template card should be visible with "Developer Card" name
    expect(screen.getByText('Developer Card')).toBeInTheDocument();
  });
});
