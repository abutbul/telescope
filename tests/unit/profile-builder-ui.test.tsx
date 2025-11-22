/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProfileBuilder from '../../src/pages/ProfileBuilder';
import TemplateCustomizer from '../../src/components/profile-builder/TemplateCustomizer';
import { useProfileBuilderStore } from '../../src/stores/profile-builder-store';
import { useUserStore } from '../../src/stores/user-store';
import { resetProfileBuilderStore, resetUserStore, sampleUser } from '../utils/store-helpers';
import type { ProfileTemplate, TemplateCustomization } from '../../src/lib/profile-builder/types';

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

    useProfileBuilderStore.setState({
      templates: [template],
      selectedTemplate: null,
      selectTemplate,
      setSearchQuery,
      setFilterCategory,
    });

    return { template, selectTemplate, setSearchQuery, setFilterCategory };
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

    useProfileBuilderStore.setState({
      templates: [template],
      selectedTemplate: template,
      customization,
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

    const useTemplateButton = screen.getByRole('button', { name: /use template/i });
    fireEvent.click(useTemplateButton);
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
