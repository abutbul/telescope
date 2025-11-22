import { Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { useProfileBuilderStore } from '../../stores/profile-builder-store';

export default function CustomizationForm() {
  const { selectedTemplate, customization, updateVariable, toggleWidget } =
    useProfileBuilderStore();

  if (!selectedTemplate || !customization) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-fit">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-5 w-5 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Customize Template</h2>
      </div>

      <div className="space-y-6">
        {/* Variables */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Profile Information</h3>
          <div className="space-y-4">
            {selectedTemplate.variables.map((variable) => {
              const value = customization.variables[variable.key] || '';

              return (
                <div key={variable.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {variable.label}
                    {variable.required && <span className="text-red-400 ml-1">*</span>}
                  </label>

                  {variable.type === 'textarea' ? (
                    <textarea
                      value={Array.isArray(value) ? value.join(', ') : value}
                      onChange={(e) => updateVariable(variable.key, e.target.value)}
                      placeholder={variable.placeholder}
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={variable.type === 'email' ? 'email' : variable.type === 'url' ? 'url' : 'text'}
                      value={Array.isArray(value) ? value.join(', ') : value}
                      onChange={(e) => updateVariable(variable.key, e.target.value)}
                      placeholder={variable.placeholder}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {variable.description && (
                    <p className="mt-1 text-xs text-gray-500">{variable.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Widgets */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Widgets & Features</h3>
          <div className="space-y-3">
            {customization.widgets.map((widget) => {
              const slot = selectedTemplate.widgets.find((w) => w.id === widget.id);
              if (!slot) return null;

              return (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 bg-gray-900 border border-gray-700 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{slot.name}</div>
                    <div className="text-xs text-gray-500">{slot.description}</div>
                  </div>
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      widget.enabled
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-gray-600 hover:text-gray-500'
                    }`}
                  >
                    {widget.enabled ? (
                      <ToggleRight className="h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
