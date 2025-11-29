import { useState } from 'react';
import { 
  Home, 
  User, 
  Code2, 
  GraduationCap, 
  Briefcase, 
  FolderGit2, 
  Mail,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Palette,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useProfileBuilderStore } from '../../stores/profile-builder-store';
import { 
  PortfolioSection, 
  PortfolioSectionType,
  PortfolioTheme,
  PortfolioCustomization,
  HomeData,
  AboutData,
  SkillsData,
  EducationData,
  ExperienceData,
  ProjectsData,
  ContactData,
  SkillCategory,
  EducationItem,
  ExperienceItem,
  ProjectItem,
} from '../../lib/profile-builder/types';

// Type-safe data casting helper
function asSectionData<T>(data: Record<string, unknown>): T {
  return data as unknown as T;
}

const sectionIcons: Record<PortfolioSectionType, typeof Home> = {
  home: Home,
  about: User,
  skills: Code2,
  education: GraduationCap,
  experience: Briefcase,
  projects: FolderGit2,
  contact: Mail,
};

const sectionLabels: Record<PortfolioSectionType, string> = {
  home: 'Home',
  about: 'About Me',
  skills: 'Skills',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  contact: 'Contact',
};

export default function PortfolioCustomizer() {
  const { portfolioCustomization, updatePortfolioSection, togglePortfolioSection, updatePortfolioTheme } = useProfileBuilderStore();
  const [activeSection, setActiveSection] = useState<string | null>('home');
  const [activeTab, setActiveTab] = useState<'sections' | 'theme' | 'preview'>('sections');

  if (!portfolioCustomization) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-400">
        No portfolio customization loaded
      </div>
    );
  }

  const sortedSections = [...portfolioCustomization.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sections'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Sections
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'theme'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Palette className="h-4 w-4 inline mr-1" />
          Theme
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Eye className="h-4 w-4 inline mr-1" />
          Preview
        </button>
      </div>

      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-lg font-semibold text-white mb-4">Sections</h3>
            {sortedSections.map((section) => {
              const Icon = sectionIcons[section.type];
              return (
                <div
                  key={section.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    activeSection === section.id
                      ? 'bg-purple-900/30 border border-purple-600'
                      : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <GripVertical className="h-4 w-4 text-gray-500 cursor-grab" />
                  <Icon className={`h-5 w-5 ${section.enabled ? 'text-purple-400' : 'text-gray-500'}`} />
                  <span className={`flex-1 ${section.enabled ? 'text-white' : 'text-gray-500'}`}>
                    {section.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePortfolioSection(section.id);
                    }}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    {section.enabled ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Section Editor */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
            {activeSection ? (
              <SectionEditor
                section={sortedSections.find((s) => s.id === activeSection)!}
                onUpdate={(data) => updatePortfolioSection(activeSection, data)}
              />
            ) : (
              <div className="text-center text-gray-400 py-12">
                Select a section to edit
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <ThemeEditor
          theme={portfolioCustomization.theme}
          onUpdate={updatePortfolioTheme}
        />
      )}

      {activeTab === 'preview' && (
        <PortfolioPreview customization={portfolioCustomization} />
      )}
    </div>
  );
}

function SectionEditor({
  section,
  onUpdate,
}: {
  section: PortfolioSection;
  onUpdate: (data: Partial<PortfolioSection>) => void;
}) {
  const Icon = sectionIcons[section.type];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-6 w-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">{sectionLabels[section.type]}</h3>
      </div>

      {/* Section Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Section Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Section-specific editors */}
      {section.type === 'home' && (
        <HomeSectionEditor data={asSectionData<HomeData>(section.data)} onUpdate={(data) => onUpdate({ data: data as unknown as Record<string, unknown> })} />
      )}
      {section.type === 'about' && (
        <AboutSectionEditor data={asSectionData<AboutData>(section.data)} onUpdate={(data) => onUpdate({ data: data as unknown as Record<string, unknown> })} />
      )}
      {section.type === 'skills' && (
        <SkillsSectionEditor data={asSectionData<SkillsData>(section.data)} onUpdate={(data) => onUpdate({ data: data as unknown as Record<string, unknown> })} />
      )}
      {section.type === 'education' && (
        <EducationSectionEditor data={asSectionData<EducationData>(section.data)} onUpdate={(data) => onUpdate({ data: data as unknown as Record<string, unknown> })} />
      )}
      {section.type === 'experience' && (
        <ExperienceSectionEditor data={asSectionData<ExperienceData>(section.data)} onUpdate={(data) => onUpdate({ data: data as unknown as Record<string, unknown> })} />
      )}
      {section.type === 'projects' && (
        <ProjectsSectionEditor data={asSectionData<ProjectsData>(section.data)} onUpdate={(data) => onUpdate({ data: data as unknown as Record<string, unknown> })} />
      )}
      {section.type === 'contact' && (
        <ContactSectionEditor data={asSectionData<ContactData>(section.data)} onUpdate={(data) => onUpdate({ data: data as unknown as Record<string, unknown> })} />
      )}
    </div>
  );
}

function HomeSectionEditor({ data, onUpdate }: { data: HomeData; onUpdate: (data: HomeData) => void }) {
  const [newRole, setNewRole] = useState('');

  const addRole = () => {
    if (newRole.trim()) {
      onUpdate({ ...data, roles: [...(data.roles || []), newRole.trim()] });
      setNewRole('');
    }
  };

  const removeRole = (index: number) => {
    onUpdate({ ...data, roles: data.roles.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onUpdate({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Roles (typewriter effect)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {data.roles?.map((role, index) => (
            <span key={index} className="px-3 py-1 bg-purple-900/30 border border-purple-600 rounded-full text-purple-300 text-sm flex items-center gap-2">
              {role}
              <button onClick={() => removeRole(index)} className="hover:text-red-400">
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRole()}
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Add a role (e.g., Full Stack Developer)"
          />
          <button
            onClick={addRole}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AboutSectionEditor({ data, onUpdate }: { data: AboutData; onUpdate: (data: AboutData) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">About Content (Markdown supported)</label>
        <textarea
          value={data.content || ''}
          onChange={(e) => onUpdate({ ...data, content: e.target.value })}
          rows={8}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          placeholder="Tell visitors about yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image URL</label>
        <input
          type="url"
          value={data.imageSource || ''}
          onChange={(e) => onUpdate({ ...data, imageSource: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="https://example.com/your-photo.jpg"
        />
      </div>
    </div>
  );
}

function SkillsSectionEditor({ data, onUpdate }: { data: SkillsData; onUpdate: (data: SkillsData) => void }) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  const addCategory = () => {
    onUpdate({
      ...data,
      skills: [...(data.skills || []), { title: 'New Category', items: [] }],
    });
  };

  const updateCategory = (index: number, category: SkillCategory) => {
    const newSkills = [...data.skills];
    newSkills[index] = category;
    onUpdate({ ...data, skills: newSkills });
  };

  const removeCategory = (index: number) => {
    onUpdate({ ...data, skills: data.skills.filter((_, i) => i !== index) });
  };

  const addSkillToCategory = (categoryIndex: number) => {
    const newSkills = [...data.skills];
    newSkills[categoryIndex].items.push({ icon: '', title: '' });
    onUpdate({ ...data, skills: newSkills });
  };

  const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
    const newSkills = [...data.skills];
    newSkills[categoryIndex].items = newSkills[categoryIndex].items.filter((_, i) => i !== skillIndex);
    onUpdate({ ...data, skills: newSkills });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Introduction</label>
        <textarea
          value={data.intro || ''}
          onChange={(e) => onUpdate({ ...data, intro: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Brief intro about your skills..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">Skill Categories</label>
          <button
            onClick={addCategory}
            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        <div className="space-y-3">
          {data.skills?.map((category, catIndex) => (
            <div key={catIndex} className="border border-gray-700 rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-2 p-3 bg-gray-900 cursor-pointer"
                onClick={() => setExpandedCategory(expandedCategory === catIndex ? null : catIndex)}
              >
                {expandedCategory === catIndex ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
                <input
                  type="text"
                  value={category.title}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateCategory(catIndex, { ...category, title: e.target.value });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-2 py-1 bg-transparent border-b border-transparent focus:border-purple-500 text-white focus:outline-none"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCategory(catIndex);
                  }}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {expandedCategory === catIndex && (
                <div className="p-3 space-y-2">
                  {category.items.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill.title}
                        onChange={(e) => {
                          const newItems = [...category.items];
                          newItems[skillIndex] = { ...skill, title: e.target.value };
                          updateCategory(catIndex, { ...category, items: newItems });
                        }}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Skill name"
                      />
                      <button
                        onClick={() => removeSkillFromCategory(catIndex, skillIndex)}
                        className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSkillToCategory(catIndex)}
                    className="w-full px-3 py-2 border border-dashed border-gray-600 rounded text-gray-400 hover:text-white hover:border-gray-500 text-sm"
                  >
                    + Add Skill
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EducationSectionEditor({ data, onUpdate }: { data: EducationData; onUpdate: (data: EducationData) => void }) {
  const addEducation = () => {
    onUpdate({
      ...data,
      education: [...(data.education || []), {
        title: '',
        cardTitle: '',
        cardSubtitle: '',
        cardDetailedText: '',
      }],
    });
  };

  const updateEducation = (index: number, item: EducationItem) => {
    const newEducation = [...data.education];
    newEducation[index] = item;
    onUpdate({ ...data, education: newEducation });
  };

  const removeEducation = (index: number) => {
    onUpdate({ ...data, education: data.education.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">Education History</label>
        <button
          onClick={addEducation}
          className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Education
        </button>
      </div>

      <div className="space-y-4">
        {data.education?.map((edu, index) => (
          <div key={index} className="p-4 border border-gray-700 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-400">Education #{index + 1}</span>
              <button
                onClick={() => removeEducation(index)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={edu.title}
              onChange={(e) => updateEducation(index, { ...edu, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Date range (e.g., 2018 - 2022)"
            />
            <input
              type="text"
              value={edu.cardTitle}
              onChange={(e) => updateEducation(index, { ...edu, cardTitle: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Degree/Certificate"
            />
            <input
              type="text"
              value={edu.cardSubtitle}
              onChange={(e) => updateEducation(index, { ...edu, cardSubtitle: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="School/University"
            />
            <input
              type="text"
              value={edu.cardDetailedText}
              onChange={(e) => updateEducation(index, { ...edu, cardDetailedText: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Additional details (GPA, honors, etc.)"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceSectionEditor({ data, onUpdate }: { data: ExperienceData; onUpdate: (data: ExperienceData) => void }) {
  const addExperience = () => {
    onUpdate({
      ...data,
      experiences: [...(data.experiences || []), {
        title: '',
        subtitle: '',
        workType: '',
        workDescription: [],
        dateText: '',
      }],
    });
  };

  const updateExperience = (index: number, item: ExperienceItem) => {
    const newExperiences = [...data.experiences];
    newExperiences[index] = item;
    onUpdate({ ...data, experiences: newExperiences });
  };

  const removeExperience = (index: number) => {
    onUpdate({ ...data, experiences: data.experiences.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">Work Experience</label>
        <button
          onClick={addExperience}
          className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {data.experiences?.map((exp, index) => (
          <div key={index} className="p-4 border border-gray-700 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-400">Experience #{index + 1}</span>
              <button
                onClick={() => removeExperience(index)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={exp.title}
              onChange={(e) => updateExperience(index, { ...exp, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Job Title"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={exp.subtitle || ''}
                onChange={(e) => updateExperience(index, { ...exp, subtitle: e.target.value })}
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Company"
              />
              <input
                type="text"
                value={exp.workType || ''}
                onChange={(e) => updateExperience(index, { ...exp, workType: e.target.value })}
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Full-time, Internship, etc."
              />
            </div>
            <input
              type="text"
              value={exp.dateText}
              onChange={(e) => updateExperience(index, { ...exp, dateText: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Date range (e.g., 01/2022 – Present)"
            />
            <textarea
              value={exp.workDescription?.join('\n') || ''}
              onChange={(e) => updateExperience(index, { ...exp, workDescription: e.target.value.split('\n').filter(Boolean) })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Key achievements (one per line, markdown supported)"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsSectionEditor({ data, onUpdate }: { data: ProjectsData; onUpdate: (data: ProjectsData) => void }) {
  const addProject = () => {
    onUpdate({
      ...data,
      projects: [...(data.projects || []), {
        title: '',
        bodyText: '',
        links: [],
        tags: [],
      }],
    });
  };

  const updateProject = (index: number, item: ProjectItem) => {
    const newProjects = [...data.projects];
    newProjects[index] = item;
    onUpdate({ ...data, projects: newProjects });
  };

  const removeProject = (index: number) => {
    onUpdate({ ...data, projects: data.projects.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">Projects</label>
        <button
          onClick={addProject}
          className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-4">
        {data.projects?.map((project, index) => (
          <div key={index} className="p-4 border border-gray-700 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-400">Project #{index + 1}</span>
              <button
                onClick={() => removeProject(index)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={project.title}
              onChange={(e) => updateProject(index, { ...project, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Project Title"
            />
            <input
              type="url"
              value={project.image || ''}
              onChange={(e) => updateProject(index, { ...project, image: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Project Image URL (optional)"
            />
            <textarea
              value={project.bodyText}
              onChange={(e) => updateProject(index, { ...project, bodyText: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Project description (markdown supported)"
            />
            <input
              type="text"
              value={project.tags?.join(', ') || ''}
              onChange={(e) => updateProject(index, { ...project, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Tags (comma-separated)"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactSectionEditor({ data, onUpdate }: { data: ContactData; onUpdate: (data: ContactData) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={data.email || ''}
          onChange={(e) => onUpdate({ ...data, email: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
        <input
          type="text"
          value={data.location || ''}
          onChange={(e) => onUpdate({ ...data, location: e.target.value })}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="San Francisco, CA"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Social Links</label>
        <div className="space-y-2">
          {data.social?.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={link.network}
                onChange={(e) => {
                  const newSocial = [...data.social];
                  newSocial[index] = { ...link, network: e.target.value };
                  onUpdate({ ...data, social: newSocial });
                }}
                className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Network"
              />
              <input
                type="url"
                value={link.href}
                onChange={(e) => {
                  const newSocial = [...data.social];
                  newSocial[index] = { ...link, href: e.target.value };
                  onUpdate({ ...data, social: newSocial });
                }}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="URL"
              />
              <button
                onClick={() => onUpdate({ ...data, social: data.social.filter((_, i) => i !== index) })}
                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => onUpdate({ ...data, social: [...(data.social || []), { network: '', href: '' }] })}
            className="w-full px-3 py-2 border border-dashed border-gray-600 rounded text-gray-400 hover:text-white hover:border-gray-500 text-sm"
          >
            + Add Social Link
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeEditor({ theme, onUpdate }: { theme: PortfolioTheme; onUpdate: (theme: PortfolioTheme) => void }) {
  const presetThemes: Partial<PortfolioTheme>[] = [
    { name: 'Dark Professional', accentColor: '#3D84C6', background: '#121212', color: '#eeeeee', mode: 'dark' as const },
    { name: 'Light Minimal', accentColor: '#2563eb', background: '#ffffff', color: '#1f2937', mode: 'light' as const },
    { name: 'Creative Dark', accentColor: '#f472b6', background: '#0f0f0f', color: '#f5f5f5', mode: 'dark' as const },
    { name: 'Ocean', accentColor: '#06b6d4', background: '#0f172a', color: '#e2e8f0', mode: 'dark' as const },
    { name: 'Forest', accentColor: '#22c55e', background: '#1a1a1a', color: '#f0fdf4', mode: 'dark' as const },
  ];

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">Theme Customization</h3>

      {/* Preset Themes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Preset Themes</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onUpdate({ ...theme, ...preset })}
              className={`p-4 rounded-lg border transition-all ${
                theme.name === preset.name
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div
                className="w-full h-8 rounded mb-2"
                style={{ backgroundColor: preset.background }}
              >
                <div
                  className="w-1/3 h-full rounded"
                  style={{ backgroundColor: preset.accentColor }}
                />
              </div>
              <span className="text-sm text-gray-300">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) => onUpdate({ ...theme, accentColor: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={theme.accentColor}
              onChange={(e) => onUpdate({ ...theme, accentColor: e.target.value })}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Background Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.background}
              onChange={(e) => onUpdate({ ...theme, background: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={theme.background}
              onChange={(e) => onUpdate({ ...theme, background: e.target.value })}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Text Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={theme.color}
              onChange={(e) => onUpdate({ ...theme, color: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={theme.color}
              onChange={(e) => onUpdate({ ...theme, color: e.target.value })}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavSectionItem {
  title: string;
  href: string;
  type?: 'link';
}

function PortfolioPreview({ customization }: { customization: PortfolioCustomization }) {
  const { portfolioRepoStatus } = useProfileBuilderStore();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Portfolio Preview</h3>
        {portfolioRepoStatus?.pagesUrl && (
          <a
            href={portfolioRepoStatus.pagesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ExternalLink className="h-4 w-4" />
            View Live Site
          </a>
        )}
      </div>

      <div 
        className="rounded-lg overflow-hidden border border-gray-700"
        style={{ backgroundColor: customization.theme.background }}
      >
        {/* Preview Nav */}
        <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: customization.theme.background }}>
          <span className="font-bold" style={{ color: customization.theme.color }}>
            {customization.nav.logo?.source ? '🌟' : ''} Portfolio
          </span>
          <div className="flex gap-4">
            {customization.nav.sections
              .filter((s: NavSectionItem) => customization.sections.find((sec: PortfolioSection) => sec.type === s.title.toLowerCase() && sec.enabled) || s.title === 'Home')
              .map((section: NavSectionItem) => (
                <span key={section.title} className="text-sm" style={{ color: customization.theme.color }}>
                  {section.title}
                </span>
              ))}
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-8 min-h-[400px]" style={{ color: customization.theme.color }}>
          {customization.sections.filter((s: PortfolioSection) => s.enabled).map((section: PortfolioSection) => (
            <div key={section.id} className="mb-8">
              {section.type === 'home' && (
                <div className="text-center py-12">
                  <h1 className="text-4xl font-bold mb-4">{asSectionData<HomeData>(section.data).name}</h1>
                  <p className="text-xl opacity-75">
                    I'm {asSectionData<HomeData>(section.data).roles?.join(' / ')}
                  </p>
                </div>
              )}
              {section.type !== 'home' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4" style={{ borderBottom: `2px solid ${customization.theme.accentColor}`, paddingBottom: '8px', display: 'inline-block' }}>
                    {section.title}
                  </h2>
                  <p className="text-sm opacity-60 mt-4">
                    {section.type === 'about' && asSectionData<AboutData>(section.data).content?.slice(0, 150) + '...'}
                    {section.type === 'skills' && `${asSectionData<SkillsData>(section.data).skills?.length || 0} skill categories`}
                    {section.type === 'education' && `${asSectionData<EducationData>(section.data).education?.length || 0} education entries`}
                    {section.type === 'experience' && `${asSectionData<ExperienceData>(section.data).experiences?.length || 0} work experiences`}
                    {section.type === 'projects' && `${asSectionData<ProjectsData>(section.data).projects?.length || 0} projects`}
                    {section.type === 'contact' && asSectionData<ContactData>(section.data).email}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Deployment Info</h4>
        <p className="text-sm text-gray-400">
          Your portfolio will be deployed to: <code className="px-2 py-1 bg-gray-900 rounded text-purple-400">https://{customization.repoName || 'username.github.io'}</code>
        </p>
      </div>
    </div>
  );
}
