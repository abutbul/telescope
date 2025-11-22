import { useState } from 'react';
import { Search, Filter, Star } from 'lucide-react';
import { useProfileBuilderStore } from '../../stores/profile-builder-store';
import { ProfileTemplate } from '../../lib/profile-builder/types';

export default function TemplateGallery() {
  const {
    templates,
    filterCategory,
    searchQuery,
    setFilterCategory,
    setSearchQuery,
    selectTemplate,
  } = useProfileBuilderStore();

  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular');

  // Filter templates
  let filteredTemplates = templates;

  if (filterCategory) {
    filteredTemplates = filteredTemplates.filter((t) => t.category === filterCategory);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredTemplates = filteredTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  // Sort templates
  filteredTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.stars - a.stars;
      case 'recent':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'minimalist', label: 'Minimalist', count: templates.filter((t) => t.category === 'minimalist').length },
    { id: 'visual', label: 'Visual', count: templates.filter((t) => t.category === 'visual').length },
    { id: 'interactive', label: 'Interactive', count: templates.filter((t) => t.category === 'interactive').length },
    { id: 'professional', label: 'Professional', count: templates.filter((t) => t.category === 'professional').length },
    { id: 'creative', label: 'Creative', count: templates.filter((t) => t.category === 'creative').length },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter & Sort */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilterCategory(category.id === 'all' ? null : category.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    (category.id === 'all' && !filterCategory) || filterCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={selectTemplate} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: ProfileTemplate;
  onSelect: (template: ProfileTemplate) => void;
}) {
  const difficultyColors = {
    beginner: 'bg-green-900/30 text-green-400 border-green-800',
    intermediate: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    advanced: 'bg-red-900/30 text-red-400 border-red-800',
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-600 transition-all group">
      {/* Preview Image */}
      <div className="aspect-video bg-gray-900 border-b border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          <span className="text-sm">Preview</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
            {template.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm">{template.stars}</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{template.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <span
            className={`px-2 py-1 rounded text-xs border ${difficultyColors[template.difficulty]}`}
          >
            {template.difficulty}
          </span>
          <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 capitalize">
            {template.category}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 rounded text-xs bg-gray-900 text-gray-400">
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 rounded text-xs bg-gray-900 text-gray-400">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

        <button
          onClick={() => onSelect(template)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}
